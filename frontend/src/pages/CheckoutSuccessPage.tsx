import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/stores/useStore';

interface CheckoutStatus {
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  order_id?: string | null;
}

const MAX_ATTEMPTS = 8;
const POLL_MS = 2000;

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const clearCart = useStore((s) => s.clearCart);

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session id');
      return;
    }
    let cancelled = false;
    let count = 0;

    const poll = async () => {
      if (cancelled) return;
      count += 1;
      setAttempts(count);
      try {
        const res = await api<CheckoutStatus>(`/checkout/status/${sessionId}`);
        if (cancelled) return;
        setStatus(res);
        if (res.payment_status === 'paid') {
          clearCart();
          return;
        }
        if (res.status === 'expired') {
          setError('Checkout session expired');
          return;
        }
        if (count < MAX_ATTEMPTS) {
          setTimeout(poll, POLL_MS);
        } else {
          setError('Payment is taking longer than expected. Check your email for confirmation.');
        }
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message || 'Failed to check status');
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  const paid = status?.payment_status === 'paid';

  return (
    <div className="min-h-[70vh] bg-[#0a201d] flex items-center justify-center px-4 py-16" data-testid="checkout-success-page">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
        {!status && !error && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#83f0c7] animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-[#fffefa]">Confirming Payment…</h1>
            <p className="text-sm text-white/60">
              Checking with Stripe (attempt {attempts}/{MAX_ATTEMPTS}).
            </p>
          </div>
        )}

        {paid && status && (
          <div className="space-y-4" data-testid="payment-success">
            <div className="w-16 h-16 rounded-full bg-[#83f0c7]/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-[#83f0c7]" />
            </div>
            <h1 className="text-2xl font-bold text-[#fffefa]">Payment Successful!</h1>
            <p className="text-sm text-white/60">
              Your order has been placed. Thank you for choosing eco-friendly fashion 🌱
            </p>
            {status.order_id && (
              <div className="text-xs text-white/40">
                Order: <span className="text-[#83f0c7] font-mono">{status.order_id}</span>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-4">
              <Link
                to="/dashboard"
                className="btn-primary inline-flex items-center justify-center gap-2"
                data-testid="go-to-dashboard"
              >
                <Package className="w-4 h-4" /> View My Orders
              </Link>
              <Link to="/" className="text-sm text-white/60 hover:text-[#83f0c7]">
                Back to Home <ArrowRight className="inline w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4" data-testid="payment-error">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#fffefa]">Hmm, something went wrong</h1>
            <p className="text-sm text-white/60">{error}</p>
            <Link to="/cart" className="btn-secondary inline-flex items-center justify-center gap-2">
              Back to Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
