// pages/index.tsx
import { useEffect, useState } from "react";

type Short = {
  id: number;
  title: string;
  videoUrl: string;
  tags: string[];
};

export default function Home() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [filtered, setFiltered] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<Short | null>(null);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    // fetch from same-site API
    fetch("/api/shorts")
      .then((r) => r.json())
      .then((data) => {
        setShorts(data);
        setFiltered(data);
      })
      .catch(() => setShorts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shortflix:likes");
      if (raw) setLikes(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("shortflix:likes", JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, shorts, selectedTag]);

  function applyFilters() {
    const term = q.trim().toLowerCase();
    let out = shorts;

    if (term) {
      out = out.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.tags.some((t) => t.toLowerCase().includes(term))
      );
    }

    if (selectedTag) {
      out = out.filter((s) => s.tags.includes(selectedTag));
    }

    setFiltered(out);
  }

  function toggleLike(id: number) {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const allTags = Array.from(new Set(shorts.flatMap((s) => s.tags)));

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, Arial", color: "#e6eef8", background: "linear-gradient(180deg,#081122,#071124)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>Short-flix — Mini Short Video Platform</h1>
            <p style={{ marginTop: 6, color: "#94a3b8", fontSize: 13 }}>Click a card to play. Likes saved locally. Deploy to Vercel for live API.</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Search title or tags..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#e6eef8" }}
            />
          </div>
        </header>

        {/* Tag filters */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => { setSelectedTag(null); }}
            style={{ padding: "6px 10px", borderRadius: 999, background: selectedTag === null ? "#06b6d4" : "rgba(255,255,255,0.03)", border: "none", color: selectedTag === null ? "#041024" : "#e6eef8", cursor: "pointer" }}
          >
            All
          </button>

          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag((prev) => (prev === t ? null : t))}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: selectedTag === t ? "#06b6d4" : "rgba(255,255,255,0.03)",
                border: "none",
                color: selectedTag === t ? "#041024" : "#e6eef8",
                cursor: "pointer"
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Player */}
        {playing ? (
          <div style={{ marginTop: 18, padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{playing.title}</strong>
              <div>
                <button onClick={() => setPlaying(null)} style={{ padding: "6px 10px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "#e6eef8" }}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <video key={playing.id} controls autoPlay style={{ width: "100%", borderRadius: 8 }}>
                <source src={playing.videoUrl} />
                Your browser does not support video tag.
              </video>
            </div>
          </div>
        ) : null}

        {/* Grid */}
        <main style={{ marginTop: 18 }}>
          {loading ? (
            <div style={{ color: "#94a3b8", padding: 18 }}>Loading shorts…</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "#94a3b8", padding: 18 }}>No videos found.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {filtered.map((s) => (
                <div key={s.id} style={{ borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column" }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setPlaying(s)}
                    style={{ height: 140, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    title="Click to play"
                  >
                    <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 22 }}>▶</div>
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                      <div>
                        <button onClick={() => toggleLike(s.id)} style={{ padding: "6px 9px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", background: "transparent", color: "#e6eef8", cursor: "pointer" }}>
                          {likes[s.id] ? "★ Liked" : "☆ Like"}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.tags.map((t) => (
                        <div key={t} style={{ padding: "4px 8px", borderRadius: 999, background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: 12 }}>
                          {t}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ color: "#94a3b8", fontSize: 13 }}>{likes[s.id] ? "You liked this" : ""}</div>
                      <div>
                        <button onClick={() => setPlaying(s)} style={{ padding: "6px 9px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", background: "transparent", color: "#e6eef8", cursor: "pointer" }}>
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
