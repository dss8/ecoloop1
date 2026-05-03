/**
 * Design History page — list saved designs and re-edit.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Trash2, Edit3, ArrowRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface SavedDesignDTO {
  id: string;
  prompt: string;
  image_base64: string;
  tshirt_color: string;
  text: string;
  material: string;
  canvas_json?: string;
  created_at: string;
}

export default function DesignHistoryPage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<SavedDesignDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const list = await api<SavedDesignDTO[]>("/saved-designs", { auth: true });
      setDesigns(list);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this design?")) return;
    try {
      await api(`/saved-designs/${id}`, { method: "DELETE", auth: true });
      setDesigns((d) => (d ? d.filter((x) => x.id !== id) : d));
      toast.success("Design deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a201d] pt-8 pb-16" data-testid="design-history-page">
      <div className="max-w-[1200px] mx-auto section-padding">
        <div className="flex items-center gap-2 text-xs mb-2">
          <Link to="/" className="text-white/50 hover:text-[#83f0c7]">
            Home
          </Link>
          <ArrowRight className="w-3 h-3 text-white/30" />
          <span className="text-[#83f0c7]">Design History</span>
        </div>

        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#fffefa]">
              My Design History
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Every design you’ve saved — edit, share, or order any of them.
            </p>
          </div>
          <Link
            to="/design-studio"
            data-testid="new-design-button"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New design
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-sm">
            {error}
          </div>
        )}

        {!designs && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {designs && designs.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl">
            <Sparkles className="w-10 h-10 text-[#83f0c7] mx-auto mb-3" />
            <p className="text-[#fffefa] font-medium mb-2">No saved designs yet</p>
            <p className="text-sm text-white/50 mb-6">
              Open the AI Design Studio and save your first creation.
            </p>
            <Link to="/design-studio" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Start designing
            </Link>
          </div>
        )}

        {designs && designs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {designs.map((d) => (
              <div
                key={d.id}
                data-testid={`design-card-${d.id}`}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#83f0c7]/40 transition-all"
              >
                <div
                  className="aspect-square flex items-center justify-center"
                  style={{ backgroundColor: d.tshirt_color }}
                >
                  {d.image_base64 ? (
                    <img
                      src={d.image_base64}
                      alt={d.prompt}
                      className="w-3/4 h-3/4 object-contain"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-white/40" />
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm text-[#fffefa] truncate" title={d.prompt}>
                    {d.prompt || "Untitled"}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/design-studio?edit=${d.id}`)}
                      data-testid={`edit-design-${d.id}`}
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-[#1d4c43] text-[#83f0c7] hover:bg-[#2a6b5e] transition-all flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      data-testid={`delete-design-${d.id}`}
                      className="px-2 py-1.5 text-xs rounded-lg bg-white/5 text-white/50 hover:bg-red-500/15 hover:text-red-300 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
