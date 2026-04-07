import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getConsentStatus, setConsentStatus } from '../services/compliance';

const COLORS = {
  pri: '#4F6AE8',
  bg: '#F4F5F9',
  tx: '#0F1117',
  txSec: '#6B7280',
  card: '#FFFFFF',
  border: '#E5E7EB',
};

export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    const consent = getConsentStatus();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    setConsentStatus({ analytics: true, marketing: true, functional: true });
    setVisible(false);
  };

  const handleSavePrefs = () => {
    setConsentStatus(prefs);
    setVisible(false);
  };

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 99999,
      background: COLORS.card,
      borderTop: `1px solid ${COLORS.border}`,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      animation: 'slideUp 0.3s ease-out',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px' }}>
        {!showPrefs ? (
          /* ---- Banner view ---- */
          <>
            <p style={{
              fontSize: 13, lineHeight: 1.5, color: COLORS.tx, margin: '0 0 12px',
            }}>
              {t('consent.banner')}{' '}
              <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer"
                style={{ color: COLORS.pri, textDecoration: 'underline' }}>
                {t('consent.privacyPolicy')}
              </a>
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAcceptAll} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: COLORS.pri, color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                {t('consent.acceptAll')}
              </button>
              <button onClick={() => setShowPrefs(true)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: COLORS.bg, color: COLORS.tx,
                border: `1px solid ${COLORS.border}`,
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                {t('consent.managePreferences')}
              </button>
            </div>
          </>
        ) : (
          /* ---- Preferences view ---- */
          <>
            <p style={{
              fontSize: 14, fontWeight: 700, color: COLORS.tx, margin: '0 0 12px',
            }}>
              {t('consent.managePreferences')}
            </p>

            {['analytics', 'marketing', 'functional'].map((key) => (
              <label key={key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 13, color: COLORS.tx, cursor: 'pointer',
              }}>
                <span>{t(`consent.${key}`)}</span>
                <div
                  onClick={() => togglePref(key)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: prefs[key] ? COLORS.pri : '#D1D5DB',
                    position: 'relative', transition: 'background 0.2s',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    background: '#fff', position: 'absolute', top: 2,
                    left: prefs[key] ? 20 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </label>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={handleSavePrefs} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: COLORS.pri, color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                {t('consent.save')}
              </button>
              <button onClick={handleAcceptAll} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: COLORS.bg, color: COLORS.tx,
                border: `1px solid ${COLORS.border}`,
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                {t('consent.acceptAll')}
              </button>
            </div>

            <p style={{ fontSize: 11, color: COLORS.txSec, marginTop: 10, textAlign: 'center' }}>
              <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer"
                style={{ color: COLORS.pri, textDecoration: 'underline' }}>
                {t('consent.privacyPolicy')}
              </a>
              {' | '}
              <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer"
                style={{ color: COLORS.pri, textDecoration: 'underline' }}>
                {t('consent.termsOfService')}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
