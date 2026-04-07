/**
 * Vercel Serverless Function: OAuth flow for wearable providers
 * Route: /api/auth/[provider]?action=connect|callback
 *
 * Handles OAuth2 authorization code flow for:
 * - Google Fit
 * - Fitbit
 * - Oura
 *
 * Environment variables needed (set in Vercel):
 * - GOOGLE_FIT_CLIENT_ID, GOOGLE_FIT_CLIENT_SECRET
 * - FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET
 * - OURA_CLIENT_ID, OURA_CLIENT_SECRET
 */

const PROVIDERS = {
  "google-fit": {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.heart_rate.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.body.read",
    ].join(" "),
    clientIdEnv: "GOOGLE_FIT_CLIENT_ID",
    clientSecretEnv: "GOOGLE_FIT_CLIENT_SECRET",
  },
  fitbit: {
    authUrl: "https://www.fitbit.com/oauth2/authorize",
    tokenUrl: "https://api.fitbit.com/oauth2/token",
    scopes: "activity heartrate sleep weight profile",
    clientIdEnv: "FITBIT_CLIENT_ID",
    clientSecretEnv: "FITBIT_CLIENT_SECRET",
  },
  oura: {
    authUrl: "https://cloud.ouraring.com/oauth/authorize",
    tokenUrl: "https://api.ouraring.com/oauth/token",
    scopes: "daily heartrate sleep workout",
    clientIdEnv: "OURA_CLIENT_ID",
    clientSecretEnv: "OURA_CLIENT_SECRET",
  },
};

function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  const { provider } = req.query;
  const action = req.query.action || "connect";

  const config = PROVIDERS[provider];
  if (!config) {
    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  }

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: `${provider} not configured. Set ${config.clientIdEnv} and ${config.clientSecretEnv} in Vercel environment variables.`,
    });
  }

  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/${provider}?action=callback`;

  // ═══ STEP 1: Redirect user to provider's OAuth consent screen ═══
  if (action === "connect") {
    const uid = req.query.uid || "";
    const state = Buffer.from(JSON.stringify({ uid, provider })).toString("base64url");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: config.scopes,
      state,
      access_type: "offline", // Google-specific but others ignore it
      prompt: "consent",
    });

    return res.redirect(302, `${config.authUrl}?${params.toString()}`);
  }

  // ═══ STEP 2: Handle OAuth callback — exchange code for tokens ═══
  if (action === "callback") {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(302, `${baseUrl}/?wearable_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(302, `${baseUrl}/?wearable_error=missing_code`);
    }

    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return res.redirect(302, `${baseUrl}/?wearable_error=invalid_state`);
    }

    // Exchange authorization code for access token
    try {
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });

      const tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Fitbit requires Basic auth
          ...(provider === "fitbit"
            ? { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}` }
            : {}),
        },
        body: tokenParams.toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error(`Token exchange failed for ${provider}:`, errText);
        return res.redirect(302, `${baseUrl}/?wearable_error=token_exchange_failed`);
      }

      const tokens = await tokenRes.json();

      // Store tokens in Firestore via Firebase Admin
      // For now, redirect with success and let the client handle Firestore storage
      // In production, you'd use Firebase Admin SDK server-side
      const tokenData = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
        scope: tokens.scope || config.scopes,
      };

      const encodedTokens = Buffer.from(JSON.stringify(tokenData)).toString("base64url");

      return res.redirect(
        302,
        `${baseUrl}/?wearable_connected=${provider}&uid=${stateData.uid}&tokens=${encodedTokens}`
      );
    } catch (err) {
      console.error(`OAuth callback error for ${provider}:`, err);
      return res.redirect(302, `${baseUrl}/?wearable_error=server_error`);
    }
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
