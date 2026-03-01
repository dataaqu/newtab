"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const SESSION_KEY = "preloader_shown";

export default function Preloader() {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setRemoved(false);
    }
  }, []);

  const handleEnded = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setFading(true);
    setTimeout(() => setRemoved(true), 800);
  }, []);

  if (removed) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease-in-out",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Dark overlay to darken the video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <video
        ref={videoRef}
        src="/load.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
