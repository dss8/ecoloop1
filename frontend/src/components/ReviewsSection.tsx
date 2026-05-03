/**
 * Customer reviews block for Product Detail page.
 *
 * Displays an overall rating, a list of reviews, and a simple "leave a review"
 * form. Currently uses mock + localStorage so it works without backend
 * dependencies; the API layer can be swapped in later.
 */
import { useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  title: string;
  body: string;
  date: string; // ISO
  helpful: number;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Aanya S.",
    rating: 5,
    title: "Buttery soft & guilt-free",
    body: "The organic cotton feels like silk after a wash. Print is sharp and didn’t fade after 4 washes. Easily my favourite tee this year.",
    date: "2026-04-12",
    helpful: 24,
  },
  {
    id: "r2",
    author: "Rohan K.",
    rating: 5,
    title: "Custom AI design, perfect fit",
    body: "Generated a Ganpati design in 20 seconds and it printed beautifully. Fit is true to size. Recommended for anyone tired of generic prints.",
    date: "2026-04-02",
    helpful: 18,
  },
  {
    id: "r3",
    author: "Meera P.",
    rating: 4,
    title: "Great quality, eco vibes",
    body: "Fabric is breathable and soft. Wish there were more colour options for the bamboo line — would have given 5 stars.",
    date: "2026-03-21",
    helpful: 11,
  },
];

function readLocal(productId: string): Review[] {
  try {
    const raw = localStorage.getItem(`ecoloop-reviews-${productId}`);
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
}

function writeLocal(productId: string, reviews: Review[]) {
  try {
    localStorage.setItem(`ecoloop-reviews-${productId}`, JSON.stringify(reviews));
  } catch {
    /* ignore */
  }
}

export default function ReviewsSection({ productId }: { productId: number | string }) {
  const key = String(productId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const local = readLocal(key);
    setReviews([...local, ...SEED_REVIEWS]);
  }, [key]);

  const stats = useMemo(() => {
    if (reviews.length === 0)
      return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.max(0, Math.min(4, 5 - r.rating));
      distribution[idx] += 1;
    });
    return { avg: sum / total, total, distribution };
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !body.trim()) return;
    const newR: Review = {
      id: `r_${Date.now()}`,
      author: author.trim(),
      rating,
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString().split("T")[0],
      helpful: 0,
    };
    const local = [newR, ...readLocal(key)];
    writeLocal(key, local);
    setReviews([newR, ...reviews]);
    setShowForm(false);
    setAuthor("");
    setTitle("");
    setBody("");
    setRating(5);
  };

  const onHelpful = (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
    setReviews(updated);
    const local = readLocal(key).map((r) =>
      r.id === id ? { ...r, helpful: r.helpful + 1 } : r,
    );
    writeLocal(key, local);
  };

  return (
    <section
      className="mt-16 pt-12 border-t border-white/10"
      data-testid="reviews-section"
    >
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#fffefa]">
            Customer Reviews
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {stats.total} review{stats.total === 1 ? "" : "s"} from real
            eco-warriors
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          data-testid="write-review-button"
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <MessageCircle className="w-4 h-4" /> Write a review
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-[#fffefa]">
            {stats.avg.toFixed(1)}
          </p>
          <div className="flex gap-1 my-2" data-testid="reviews-average-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`w-5 h-5 ${
                  n <= Math.round(stats.avg)
                    ? "fill-[#f5a623] text-[#f5a623]"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/50">{stats.total} ratings</p>
        </div>

        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          {[5, 4, 3, 2, 1].map((star, i) => {
            const count = stats.distribution[i] || 0;
            const pct = stats.total === 0 ? 0 : (count / stats.total) * 100;
            return (
              <div key={star} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="text-xs text-white/50 w-8">{star}★</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f5a623] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-white/40 w-10 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          data-testid="review-form"
          className="glass-card p-6 rounded-2xl mb-8 space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              data-testid="review-author-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              required
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  data-testid={`review-rating-${n}`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      n <= rating
                        ? "fill-[#f5a623] text-[#f5a623]"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            data-testid="review-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50"
          />
          <textarea
            data-testid="review-body-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell other shoppers what you loved (or didn't) about this tee..."
            required
            rows={4}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#fffefa] focus:outline-none focus:border-[#83f0c7]/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              data-testid="review-submit-button"
              className="btn-primary text-sm"
            >
              Post review
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <article
            key={r.id}
            data-testid={`review-${r.id}`}
            className="glass-card p-5 rounded-2xl"
          >
            <header className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#83f0c7] to-[#1d4c43] flex items-center justify-center text-sm font-bold text-white">
                  {r.author[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-[#fffefa] font-medium">{r.author}</p>
                  <p className="text-[10px] text-white/40">{r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${
                      n <= r.rating
                        ? "fill-[#f5a623] text-[#f5a623]"
                        : "text-white/15"
                    }`}
                  />
                ))}
              </div>
            </header>
            <h4 className="text-base font-semibold text-[#fffefa] mb-1">{r.title}</h4>
            <p className="text-sm text-white/70 leading-relaxed">{r.body}</p>
            <button
              onClick={() => onHelpful(r.id)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-[#83f0c7] transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({r.helpful})
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
