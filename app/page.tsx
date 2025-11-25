"use client";

import { useEffect, useState } from "react";

interface ShortItem {
  id: string;
  title: string;
  videoUrl: string;
  tags: string[];
}

export default function Home() {
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [selected, setSelected] = useState<ShortItem | null>(null);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await fetch("/api/shorts");
        const data = await res.json();
        setShorts(data);
      } catch (error) {
        console.error("Failed to fetch shorts:", error);
      }
    };
    fetchShorts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🎬 ShortFlix</h1>

      {/* Netflix-style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {shorts.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer group"
            onClick={() => setSelected(item)}
          >
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={item.videoUrl}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                muted
              />
            </div>
            <p className="mt-2 text-sm font-semibold truncate">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg max-w-xl w-full relative">
            <button
              className="absolute top-2 right-2 text-lg"
              onClick={() => setSelected(null)}
            >
              ✖
            </button>

            <video
              controls
              autoPlay
              className="w-full rounded-lg"
              src={selected.videoUrl}
            />

            <h2 className="text-xl font-bold mt-3">{selected.title}</h2>

            <div className="flex gap-2 mt-2 flex-wrap">
              {selected.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
