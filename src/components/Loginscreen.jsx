import { useState } from "react"
import { Github, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { signInWithGitHub, signInWithEmail, signUpWithEmail } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function LoginScreen() {
  const [mode,     setMode]     = useState('login')  // 'login' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')

  const handleGitHub = async () => {
    setLoading(true); setError('')
    try { await signInWithGitHub() }
    catch (e) { setError(e.message); setLoading(false) }
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError(''); setInfo('')
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
        setInfo('Check your email for a confirmation link.')
        setLoading(false)
        return
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-primary tracking-tight">devlog</h1>
          <p className="text-[12px] text-faint mt-1 uppercase tracking-widest">daily work log</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-subtle bg-card p-6">
          <h2 className="text-sm font-semibold text-primary mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-[11px] text-faint mb-5">
            {mode === 'login' ? 'Sign in to your work log' : 'Start tracking your dev work'}
          </p>

          {/* GitHub */}
          <button
            onClick={handleGitHub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-9 rounded-lg border border-subtle bg-elevated hover:bg-hover text-primary text-[12px] font-medium transition-all disabled:opacity-50 mb-4"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-subtle" />
            <span className="text-[10px] text-faint uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-subtle" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label className="text-[10px] text-faint uppercase tracking-widest block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-9 rounded-lg border border-subtle bg-elevated px-3 text-[12px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-faint uppercase tracking-widest block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 rounded-lg border border-subtle bg-elevated px-3 pr-9 text-[12px] text-primary placeholder:text-faint focus:outline-none focus:border-subtle-hover transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-primary transition-colors"
                >
                  {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Error / info */}
            {error && (
              <p className="text-[11px] text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
            {info && (
              <p className="text-[11px] text-green-400 bg-green-400/10 rounded-lg px-3 py-2">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-9 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] text-[12px] font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-[11px] text-faint mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setInfo('') }}
              className="text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-faint mt-6">
          your data is private and only visible to you
        </p>
      </div>
    </div>
  )
}