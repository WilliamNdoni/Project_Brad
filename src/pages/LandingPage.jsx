import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const video = document.getElementById("intro-video");

    const tryPlay = () => {
      video.play().catch(() => setShowModal(true));
    };

    video.addEventListener("ended", () => setShowModal(true));
    video.addEventListener("error", () => setShowModal(true));
    document.addEventListener("touchstart", tryPlay, { once: true });

    tryPlay();
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100dvh" }}
    >
      <video
        id="intro-video"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        autoPlay
        muted
        playsInline
        src="/Intro_vid.mp4"
      />

      <div className="absolute inset-0 bg-black/40" />

      {showModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-[340px] shadow-2xl animate-slideUp">

            <div className="flex items-center gap-3 mb-6">
              <img
                src="/G7_logo.jpeg"
                alt="G7 logo"
                className="w-16 h-16 rounded-xl object-contain"
              />
              <div>
                <p className="font-bold text-gray-900 text-base">GenerationIron7</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Client Payment Portal
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome 👋</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Effortless payment tracking between Brad and his clients.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Sign in to your account
            </button>

            <div className="flex items-center gap-2 my-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />
              or
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={() => navigate("/register")}
              className="w-full py-3 border border-gray-200 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
            >
              Create a new account
            </button>

          </div>
        </div>
      )}
    </div>
  );
}