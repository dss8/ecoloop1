import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { logInWithEmail, friendlyAuthError } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useStore } from '@/stores/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from || '/dashboard';
  const storeLogin = useStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isFirebaseConfigured) {
      toast.error('Firebase is not configured. Add VITE_FIREBASE_* env vars to /app/frontend/.env');
      setErrorMsg('Auth backend not configured. Please contact the admin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await logInWithEmail(email.trim(), password);
      toast.success('Welcome back!');
      storeLogin({
        name: user.displayName || email.split('@')[0],
        email: user.email || email,
        phone: '',
        avatar: user.photoURL || '',
      });
      navigate(fromPath);
    } catch (err) {
      const msg = friendlyAuthError(err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a201d] flex" data-testid="login-page">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero/hero_banner.jpg"
            alt="Eco Design"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a201d]/95 via-[#0a201d]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#fffefa]">
              ECO<span className="text-[#83f0c7]">LOOP</span>
            </span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#fffefa] leading-tight">
              Welcome back to<br />
              <span className="text-gradient">Sustainable</span><br />
              Fashion
            </h2>
            <p className="text-white/60 max-w-md">
              Sign in to continue designing eco-friendly t-shirts with our AI studio.
            </p>
          </div>

          <p className="text-xs text-white/40">© 2026 ECOLOOP. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#fffefa]">
              ECO<span className="text-[#83f0c7]">LOOP</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#fffefa] mb-2">Welcome Back</h1>
            <p className="text-sm text-white/50">Sign in to your ECOLOOP account</p>
          </div>

          {!isFirebaseConfigured && (
            <div
              className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs"
              data-testid="firebase-warning"
            >
              Firebase isn’t configured yet. Set <code>VITE_FIREBASE_*</code> values in
              <code> /app/frontend/.env</code> and restart the frontend.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-xs text-white/60 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div
                className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                data-testid="login-error"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#1d4c43] text-white rounded-xl font-medium hover:bg-[#2a6b5e] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/50">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="ml-1 text-[#83f0c7] font-medium hover:underline"
                data-testid="go-to-signup-link"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
