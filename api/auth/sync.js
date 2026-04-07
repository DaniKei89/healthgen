/**
 * Vercel Serverless Function: Sync health data from connected providers
 * Route: /api/auth/sync?provider=google-fit&accessToken=...
 *
 * Fetches latest health data from the provider's API and returns normalized data.
 */

const DATA_FETCHERS = {
  "google-fit": async (accessToken) => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    // Fetch steps, heart rate, sleep from Google Fit
    const res = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            { dataTypeName: "com.google.step_count.delta" },
            { dataTypeName: "com.google.heart_rate.bpm" },
            { dataTypeName: "com.google.calories.expended" },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: dayAgo,
          endTimeMillis: now,
        }),
      }
    );

    if (!res.ok) throw new Error(`Google Fit API error: ${res.status}`);
    const data = await res.json();

    let steps = 0, heartRate = 0, calories = 0;
    for (const bucket of data.bucket || []) {
      for (const ds of bucket.dataset || []) {
        for (const pt of ds.point || []) {
          if (ds.dataSourceId?.includes("step_count")) {
            steps += pt.value?.[0]?.intVal || 0;
          } else if (ds.dataSourceId?.includes("heart_rate")) {
            heartRate = pt.value?.[0]?.fpVal || heartRate;
          } else if (ds.dataSourceId?.includes("calories")) {
            calories += pt.value?.[0]?.fpVal || 0;
          }
        }
      }
    }

    return {
      steps: { v: steps, g: 10000, u: "steps", l: "Steps today", src: "Google Fit", cl: "#4F6AE8" },
      cal: { v: Math.round(calories), g: 650, u: "kcal", l: "Calories", src: "Google Fit", cl: "#E93D82" },
      hr: heartRate ? { v: Math.round(heartRate), g: 0, u: "bpm", l: "Heart rate", src: "Google Fit", cl: "#E5484D" } : null,
    };
  },

  fitbit: async (accessToken) => {
    const today = new Date().toISOString().split("T")[0];
    const headers = { Authorization: `Bearer ${accessToken}` };

    const [activityRes, sleepRes, hrRes] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, { headers }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, { headers }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, { headers }),
    ]);

    const activity = activityRes.ok ? await activityRes.json() : {};
    const sleep = sleepRes.ok ? await sleepRes.json() : {};
    const hr = hrRes.ok ? await hrRes.json() : {};

    const summary = activity.summary || {};
    const sleepTotal = (sleep.summary?.totalMinutesAsleep || 0) / 60;
    const restingHR = hr["activities-heart"]?.[0]?.value?.restingHeartRate || 0;

    return {
      steps: { v: summary.steps || 0, g: 10000, u: "steps", l: "Steps today", src: "Fitbit", cl: "#4F6AE8" },
      cal: { v: summary.caloriesOut || 0, g: 650, u: "kcal", l: "Calories", src: "Fitbit", cl: "#E93D82" },
      sleep: { v: parseFloat(sleepTotal.toFixed(1)), g: 8, u: "hrs", l: "Sleep", src: "Fitbit", cl: "#7C66DC" },
      hr: restingHR ? { v: restingHR, g: 0, u: "bpm", l: "Resting HR", src: "Fitbit", cl: "#E5484D" } : null,
    };
  },

  oura: async (accessToken) => {
    const today = new Date().toISOString().split("T")[0];
    const headers = { Authorization: `Bearer ${accessToken}` };

    const [sleepRes, activityRes, hrRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${today}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${today}&end_date=${today}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/heartrate?start_date=${today}&end_date=${today}`, { headers }),
    ]);

    const sleepData = sleepRes.ok ? await sleepRes.json() : {};
    const activityData = activityRes.ok ? await activityRes.json() : {};
    const hrData = hrRes.ok ? await hrRes.json() : {};

    const sleepEntry = sleepData.data?.[0];
    const activityEntry = activityData.data?.[0];
    const latestHR = hrData.data?.[hrData.data?.length - 1];

    return {
      sleep: sleepEntry ? { v: parseFloat((sleepEntry.contributors?.total_sleep / 3600 || 0).toFixed(1)), g: 8, u: "hrs", l: "Sleep", src: "Oura", cl: "#7C66DC" } : null,
      steps: activityEntry ? { v: activityEntry.steps || 0, g: 10000, u: "steps", l: "Steps", src: "Oura", cl: "#4F6AE8" } : null,
      cal: activityEntry ? { v: activityEntry.active_calories || 0, g: 650, u: "kcal", l: "Active cal", src: "Oura", cl: "#E93D82" } : null,
      hrv: sleepEntry ? { v: sleepEntry.contributors?.hrv_balance || 0, g: 40, u: "ms", l: "HRV", src: "Oura", cl: "#FF8B3E" } : null,
      hr: latestHR ? { v: latestHR.bpm, g: 0, u: "bpm", l: "Heart rate", src: "Oura", cl: "#E5484D" } : null,
    };
  },
};

export default async function handler(req, res) {
  const { provider, accessToken } = req.query;

  if (!provider || !accessToken) {
    return res.status(400).json({ error: "Missing provider or accessToken" });
  }

  const fetcher = DATA_FETCHERS[provider];
  if (!fetcher) {
    return res.status(400).json({ error: `No data fetcher for: ${provider}` });
  }

  try {
    const data = await fetcher(accessToken);
    // Remove null entries
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null));
    return res.status(200).json({ success: true, provider, data: cleaned, syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error(`Sync error for ${provider}:`, err);
    return res.status(500).json({ error: err.message });
  }
}
