import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, useAuth } from './AuthContext.jsx'

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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#0F1117', marginTop: 14 }}>
        Health<span style={{ color: '#4F6AE8' }}>Gen</span>
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
    </AuthProvider>
  </StrictMode>,
)
