import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n before anything else
import { AuthProvider, useAuth } from './AuthContext.jsx'
import CookieConsent from './components/CookieConsent.jsx'

// Lazy load heavy components — only loads what's needed
const App = lazy(() => import('./App.jsx'))
const DesktopApp = lazy(() => import('./DesktopApp.jsx'))
const Onboarding = lazy(() => import('./Onboarding.jsx'))

function LoadingSplash() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F4F5F9',
      fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes breathe{0%{transform:scale(1);opacity:0.8}50%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:0.8}}
      `}</style>
      <div style={{
        width: 52, height: 52, borderRadius: 15,
        background: 'linear-gradient(135deg,#4F6AE8,#7C66DC)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(79,106,232,0.3)',
        animation: 'breathe 2s ease-in-out infinite',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M1 12C4 5,8 5,12 12C16 19,20 19,23 12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          <path d="M1 12C4 19,8 19,12 12C16 5,20 5,23 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="6" y1="8" x2="6" y2="16" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round"/>
          <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
          <line x1="18" y1="8" x2="18" y2="16" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round"/>
          <circle cx="12" cy="6" r="2" fill="white"/>
          <circle cx="8" cy="17" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="16" cy="17" r="1.5" fill="white" opacity="0.6"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#0F1117', marginTop: 14 }}>
        Ledora<span style={{ color: '#4F6AE8' }}>AI</span>
      </p>
    </div>
  )
}

function Root() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const { loading, authStep, onboardingDone } = useAuth()

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle OAuth callback from wearable providers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const provider = params.get('wearable_connected')
    const uid = params.get('uid')
    const tokens = params.get('tokens')
    const error = params.get('wearable_error')

    if (error) {
      console.error('Wearable connection error:', error)
      window.history.replaceState({}, '', '/')
    } else if (provider && uid && tokens) {
      import('./services/wearables').then(({ handleOAuthCallback }) => {
        try {
          const tokenData = JSON.parse(atob(tokens.replace(/-/g,'+').replace(/_/g,'/')))
          handleOAuthCallback(uid, provider, tokenData)
            .then(() => { window.history.replaceState({}, '', '/') })
            .catch(err => console.error('OAuth save error:', err))
        } catch (e) { console.error('Token parse error:', e) }
      })
    }
  }, [])

  if (loading) return <LoadingSplash />

  return (
    <Suspense fallback={<LoadingSplash />}>
      {authStep !== 'authenticated' || !onboardingDone
        ? <Onboarding />
        : isDesktop ? <DesktopApp /> : <App />
      }
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
      <CookieConsent />
    </AuthProvider>
  </StrictMode>,
)
