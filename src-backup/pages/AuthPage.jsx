import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VisionLogo from '../components/VisionLogo'
import {
  loginUser,
  saveAuthUser,
  signupUser,
} from '../services/authApi'

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {desc}
        </p>
      </div>
    </div>
  )
}

export default function AuthPage({ view = 'signin' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isSignup = view === 'signup'

  const [name, setName] = useState('')
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')

  const signupSuccess =
    !isSignup && Boolean(location.state?.accountCreated)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const user = await loginUser({ email, password })

      // Keep this exact key: the Vision SDK already reads auth_user.
      saveAuthUser(user)

      // Never retain a project selected by a previous login/session.
      localStorage.removeItem('vision_project_id')

      const destination = location.state?.from || '/projects'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

 const handleDemoLogin = async () => {
  setError('')

  try {
    setDemoLoading(true)

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 950)
    )

    const demoUser = {
      userId: 'devday-demo',
      name: 'Dev Day User',
      email: 'demo@vision.dev',
      initials: 'DD',
      role: 'Demo Admin',
      isDemo: true,
    }

    saveAuthUser(demoUser)

    localStorage.removeItem(
      'vision_project_id'
    )

    navigate(
      '/projects',
      {
        replace: true,
      }
    )
  } catch {
    setError(
      'Unable to launch the Dev Day demo.'
    )
  } finally {
    setDemoLoading(false)
  }
}

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in Name, Email and Password.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    try {
      setLoading(true)

      await signupUser({
        name,
        email,
        password,
        company,
      })

      // Current backend has no email-verification endpoint/token yet,
      // so send the new user to real login instead of showing a fake
      // "verification sent" state.
      navigate('/login', {
        replace: true,
        state: {
          accountCreated: true,
          email: email.trim().toLowerCase(),
        },
      })
    } catch (err) {
      setError(err.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12"
        style={{
          background:
            'linear-gradient(160deg, #312E81 0%, #1E1B4B 40%, #0F0E2A 100%)',
        }}
      >
        <div>
          <VisionLogo
            size={36}
            theme="color"
            showWordmark
            wordmarkColor="#fff"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
            Understand your customers.
            <br />
            <span style={{ color: '#A5B4FC' }}>
              Act on what you find.
            </span>
          </h2>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Vision brings analytics, personas, revenue intelligence, heatmaps
            and session replay together so teams can understand what customers
            do and act on it quickly.
          </p>

          <div className="space-y-4 pt-2">
            <FeatureRow
              icon={
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(165,180,252,1)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Persona Intelligence"
              desc="Automatically understand loyal, active, first-time and guest audiences."
            />

            <FeatureRow
              icon={
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(165,180,252,1)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title="Behaviour Analytics"
              desc="Understand funnels, journeys, heatmaps and real session replays."
            />

            <FeatureRow
              icon={
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(165,180,252,1)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              title="Revenue Intelligence"
              desc="See which audiences, journeys and decisions are actually driving growth."
            />
          </div>
        </div>

        <div
          className="flex items-center gap-3 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex -space-x-2">
            {['AP', 'NM', 'LF'].map((initials) => (
              <div
                key={initials}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2"
                style={{
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  borderColor: '#1E1B4B',
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <p
            className="text-xs"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Built for teams that want clearer customer decisions
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center px-5 py-10 sm:p-8"
        style={{ background: '#F8FAFC' }}
      >
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden justify-center mb-7">
            <VisionLogo
              size={40}
              theme="color"
              showWordmark
              wordmarkColor="#0F1117"
            />
          </div>

          {isSignup ? (
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Create your account
              </h1>
              <p className="text-sm text-slate-500 mb-7">
                Create your Vision workspace and connect your first project.
              </p>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <form onSubmit={(e) => {
    e.preventDefault()
  }} className="space-y-4">
                <FormField label="Full name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jamie Smith"
                    autoComplete="name"
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Work email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Password">
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    show={showPass}
                    onToggle={() => setShowPass((current) => !current)}
                    autoComplete="new-password"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Use at least 8 characters.
                  </p>
                </FormField>

                <FormField
                  label={
                    <>
                      Company / Team name{' '}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </>
                  }
                >
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    autoComplete="organization"
                    className={inputClasses}
                  />
                </FormField>

                <SubmitButton loading={loading}>
                  {loading ? 'Creating account…' : 'Create account'}
                </SubmitButton>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4 leading-5">
                By signing up you agree to the Terms of Service and Privacy
                Policy.
              </p>

              <p className="text-center text-sm text-slate-500 mt-5">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-bold hover:opacity-80"
                  style={{ color: '#6366F1' }}
                >
                  Sign in
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Sign in
              </h1>
              <p className="text-sm text-slate-500 mb-7">
                Welcome back — sign in to your Vision workspace.
              </p>

              {signupSuccess && (
                <div
                  className="mb-4 px-3 py-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  Account created successfully. Sign in to continue.
                </div>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <form onSubmit={handleSignIn} className="space-y-4">
                <FormField label="Work email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className={inputClasses}
                  />
                </FormField>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold opacity-50 cursor-not-allowed"
                      style={{ color: '#6366F1' }}
                      title="Forgot-password flow is not wired yet"
                      disabled
                    >
                      Forgot password?
                    </button>
                  </div>

                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    show={showPass}
                    onToggle={() => setShowPass((current) => !current)}
                    autoComplete="current-password"
                  />
                </div>

                <SubmitButton loading={loading || demoLoading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </SubmitButton>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Dev Day shortcut
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <DevDayDemoButton
                loading={demoLoading}
                disabled={loading}
                onClick={handleDemoLogin}
              />

              <p className="text-center text-[11px] text-slate-400 mt-2.5">
                One click, no credentials — straight into the demo workspace.
              </p>

              <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="font-bold hover:opacity-80"
                  style={{ color: '#6366F1' }}
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputClasses =
  'w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-white border-slate-200 placeholder:text-slate-400'

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, autoComplete }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        autoComplete={autoComplete}
        className={`${inputClasses} pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: '#94A3B8' }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  )
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
      style={{
        background: loading
          ? '#A5B4FC'
          : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      }}
    >
      {children}
    </button>
  )
}

function DevDayDemoButton({ loading, disabled, onClick }) {
  return (
    <>
      <style>{`
        @keyframes visionDemoGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes visionDemoRocket {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }

        @keyframes visionDemoOrbit {
          to { transform: rotate(360deg); }
        }

        @keyframes visionDemoShimmer {
          0% { transform: translateX(-140%) skewX(-18deg); }
          100% { transform: translateX(260%) skewX(-18deg); }
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="group relative w-full overflow-hidden rounded-xl p-[1px] shadow-[0_10px_30px_rgba(99,102,241,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(99,102,241,0.30)] disabled:cursor-not-allowed disabled:opacity-80"
        style={{
          background:
            'linear-gradient(110deg, #6366F1, #8B5CF6, #EC4899, #6366F1)',
          backgroundSize: '240% 240%',
          animation: 'visionDemoGradient 4s ease infinite',
        }}
      >
        {!loading && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-white/25 blur-md"
            style={{ animation: 'visionDemoShimmer 2.8s ease-in-out infinite' }}
          />
        )}

        <span className="relative flex min-h-[48px] items-center justify-center gap-3 rounded-[11px] bg-slate-950/90 px-4 text-sm font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-slate-950/80">
          {loading ? (
            <>
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span className="absolute h-6 w-6 rounded-full border border-indigo-300/30" />
                <span
                  className="absolute h-6 w-6 rounded-full border-2 border-transparent border-t-indigo-300 border-r-fuchsia-300"
                  style={{ animation: 'visionDemoOrbit 0.75s linear infinite' }}
                />
                <span className="text-[10px]">✦</span>
              </span>

              <span className="flex flex-col items-start leading-tight">
                <span>Launching Dev Day…</span>
                <span className="mt-0.5 text-[10px] font-medium text-indigo-200/75">
                  Warming up the dashboards
                </span>
              </span>
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="text-lg"
                style={{ animation: 'visionDemoRocket 1.5s ease-in-out infinite' }}
              >
                🚀
              </span>

              <span>Enter Dev Day Demo</span>

              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-indigo-100">
                Instant
              </span>
            </>
          )}
        </span>
      </button>
    </>
  )
}

function ErrorMessage({ children }) {
  return (
    <div
      className="mb-4 px-3 py-2.5 rounded-xl text-xs font-semibold"
      style={{
        background: '#FEF2F2',
        color: '#EF4444',
        border: '1px solid #FECACA',
      }}
    >
      {children}
    </div>
  )
}
