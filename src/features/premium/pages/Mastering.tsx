import { useState } from "react";

const studioImages = [
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
];

const heroImage =
  "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80";

function DolbyLogo() {
  return (
    <svg
      width="60"
      height="20"
      viewBox="0 0 60 20"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Dolby"
    >
      <rect x="0" y="0" width="9" height="20" rx="4.5" />
      <rect x="11" y="4" width="9" height="12" rx="4.5" />
      <text x="22" y="15" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        DOLBY
      </text>
    </svg>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-md mx-4 p-7"
        style={{ background: "#1a1a1a", border: "1px solid #333" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-white font-bold text-lg mb-5"
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          Choose a track to master
        </h2>

        <p
          className="text-sm font-semibold mb-8"
          style={{ color: "#d1d5db" }}
        >
          Sorry, but you do not have any eligible tracks at this time.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-full transition-colors"
            style={{
              color: "#e5e7eb",
              background: "transparent",
              fontFamily: "'Archivo', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#fff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#e5e7eb")
            }
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 text-sm font-bold rounded-full transition-all"
            style={{
              background: "#fff",
              color: "#111",
              fontFamily: "'Archivo Black', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#e5e7eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#fff")
            }
          >
            Upload a new track
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SoundCloudMastering() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#111",
        fontFamily: "'Archivo', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap');

        .hero-bg {
          background: linear-gradient(135deg, #4b1fa7 0%, #9b1faf 35%, #d63a7a 65%, #e8526a 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 20% 80%, rgba(180,40,160,0.5) 0%, transparent 55%),
                      radial-gradient(ellipse at 80% 20%, rgba(90,20,180,0.5) 0%, transparent 55%);
          pointer-events: none;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.55;
        }
        .card-img {
          filter: grayscale(100%) contrast(1.1);
          transition: filter 0.3s;
        }
        .card-img:hover {
          filter: grayscale(60%) contrast(1.1);
        }
        .get-started-btn {
          background: #fff;
          color: #111;
          font-family: 'Archivo Black', sans-serif;
          font-size: 1rem;
          padding: 14px 36px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.2s, transform 0.15s;
          display: inline-block;
        }
        .get-started-btn:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }
      `}</style>

      {/* Hero */}
      <section className="hero-bg flex-1 px-8 md:px-16 pt-14 pb-0">
        {/* Blobs */}
        <div
          className="blob"
          style={{
            width: 420,
            height: 420,
            background: "#b03aff",
            top: "-80px",
            left: "-100px",
          }}
        />
        <div
          className="blob"
          style={{
            width: 300,
            height: 300,
            background: "#ff3a6e",
            bottom: "60px",
            right: "10%",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left */}
          <div className="flex-1 flex flex-col gap-6 py-10">
            <h1
              className="text-white leading-none"
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                letterSpacing: "-0.02em",
              }}
            >
              MASTERING ON
              <br />
              SOUNDCLOUD
            </h1>

            <div className="flex items-center gap-2 -mt-1">
              <span className="text-white text-sm font-medium opacity-80">
                Powered by
              </span>
              <DolbyLogo />
            </div>

            <p
              className="text-white text-lg leading-relaxed max-w-sm opacity-90"
              style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 400 }}
            >
              For a fraction of the cost, get your tracks release-ready for
              streaming platforms without ever leaving your SoundCloud account.
            </p>

            <div className="mt-2">
              <button
                className="get-started-btn"
                onClick={() => setModalOpen(true)}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right — Hero image */}
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "clamp(280px, 38vw, 480px)",
              aspectRatio: "4/3",
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            <img
              src={heroImage}
              alt="Music producer in studio"
              className="card-img w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom cards row */}
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-3 gap-4 mt-10 pb-0">
          {studioImages.map((src, i) => (
            <div
              key={i}
              className="rounded-t-2xl overflow-hidden shadow-lg"
              style={{
                border: "2px solid rgba(255,255,255,0.08)",
                aspectRatio: "4/3",
              }}
            >
              <img
                src={src}
                alt={`Studio ${i + 1}`}
                className="card-img w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </div>
  );
}