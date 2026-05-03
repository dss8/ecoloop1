import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { signUpWithEmail, friendlyAuthError } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useStore } from '@/stores/useStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const storeLogin = useStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!isFirebaseConfigured) {
      // Dev-mode: simulate a local signup
      const cleanEmail = email.trim();
      const devUid = "dev_" + cleanEmail.replace(/[^a-z0-9]/gi, "_").slice(0, 24);
      localStorage.setItem("ecoloop-dev-uid", devUid);
      localStorage.setItem("ecoloop-dev-email", cleanEmail);
      storeLogin({
        name: name || cleanEmail.split("@")[0] || "Eco User",
        email: cleanEmail,
        phone: "",
        avatar: "",
      });
      toast.success("Account created (dev mode)");
      navigate("/dashboard");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await signUpWithEmail(email.trim(), password, name.trim());
      toast.success('Welcome to ECOLOOP!');
      storeLogin({
        name: name || (user.email ? user.email.split('@')[0] : 'Eco User'),
        email: user.email || email,
        phone: '',
        avatar: user.photoURL || '',
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = friendlyAuthError(err);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a201d] flex" data-testid="signup-page">
      {/* Left Visual */}
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#fffefa]">
              ECO<span className="text-[#83f0c7]">LOOP</span>
            </span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#fffefa] leading-tight">
              Join the<br />
              <span className="text-gradient">Sustainable</span><br />
              Fashion Movement
            </h2>
            <p className="text-white/60 max-w-md">
              Create eco-friendly custom t-shirts with AI-powered design tools. Every purchase plants a tree.
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-[#83f0c7]">50K+</p>
                <p className="text-xs text-white/50">Trees Planted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#83f0c7]">20+</p>
                <p className="text-xs text-white/50">Eco Designs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#83f0c7]">100%</p>
                <p className="text-xs text-white/50">Organic</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/40">© 2026 ECOLOOP. All rights reserved.</p>
        </div>
      </div>

      {/* Right Form */}
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
            <h1 className="text-3xl font-bold text-[#fffefa] mb-2">Create Account</h1>
            <p className="text-sm text-white/50">Join our community of eco-conscious creators</p>
          </div>

          {!isFirebaseConfigured && (
            <div
              className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs"
              data-testid="firebase-warning"
            >
              Firebase isn’t configured. Set <code>VITE_FIREBASE_*</code> in
              <code> /app/frontend/.env</code> and restart.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
            <div>
              <label className="block text-xs text-white/60 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-testid="signup-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-testid="signup-email-input"
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
                  data-testid="signup-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-12 pl-10 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  data-testid="signup-confirm-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full h-12 pl-10 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-[#fffefa] placeholder:text-white/30 focus:outline-none focus:border-[#83f0c7]/50 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {errorMsg && (
              <div
                className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                data-testid="signup-error"
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              data-testid="signup-submit-button"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#1d4c43] text-white rounded-xl font-medium hover:bg-[#2a6b5e] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-white/50">
              Already have an account?{' '}
              <Link
                to="/login"
                className="ml-1 text-[#83f0c7] font-medium hover:underline"
                data-testid="go-to-login-link"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
