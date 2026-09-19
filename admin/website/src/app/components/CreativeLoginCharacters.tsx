import React, { useState, useEffect, useRef } from "react";

interface CreativeLoginCharactersProps {
  focusedField: "none" | "email" | "password";
  isPasswordVisible: boolean;
  emailLength: number;
  passwordLength: number;
  isSubmitting?: boolean;
  hasError?: boolean;
}

export default function CreativeLoginCharacters({
  focusedField,
  isPasswordVisible,
  emailLength,
  passwordLength,
  isSubmitting = false,
  hasError = false,
}: CreativeLoginCharactersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      setMousePos({
        x: Math.max(-1, Math.min(1, deltaX)),
        y: Math.max(-1, Math.min(1, deltaY)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Compute gaze coordinates based on input focus or mouse
  let gazeX = mousePos.x * 7;
  let gazeY = mousePos.y * 5;

  if (focusedField === "email") {
    // Look to the right towards the form inputs, moving slightly as more text is typed
    gazeX = 6 + Math.min(emailLength * 0.15, 3);
    gazeY = 2 + Math.min(emailLength * 0.1, 4);
  } else if (focusedField === "password" && !isPasswordVisible) {
    // Secretive / shy mode: characters look away or up
    gazeX = -4;
    gazeY = -6;
  } else if (focusedField === "password" && isPasswordVisible) {
    // Peeking mode: look towards password
    gazeX = 7;
    gazeY = 5;
  }

  const isHidingEyes = focusedField === "password" && !isPasswordVisible;
  const isPeeking = focusedField === "password" && isPasswordVisible;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] md:min-h-[460px] flex items-end justify-center select-none overflow-hidden"
    >
      <svg
        viewBox="0 0 360 380"
        className="w-full max-w-[340px] md:max-w-[380px] h-auto transition-transform duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow base under characters */}
        <ellipse cx="180" cy="365" rx="140" ry="12" fill="#e2e8f0" opacity="0.6" />

        {/* ── 1. PURPLE RECTANGLE CHARACTER (Center-Back) ── */}
        <g
          className="transition-transform duration-500 ease-out"
          style={{
            transform: isSubmitting
              ? "translateY(8px)"
              : isHidingEyes
              ? "translateY(-4px)"
              : hasError
              ? "translate(-3px, 2px)"
              : `translate(${gazeX * 0.25}px, ${gazeY * 0.2}px)`,
          }}
        >
          {/* Main Body */}
          <path
            d="M92 90 Q92 78 104 78 L146 78 Q158 78 158 90 L158 355 L92 355 Z"
            fill="#6C5CE7"
          />

          {/* Eyes (Open or Blink/Closed) */}
          {!isHidingEyes ? (
            <g
              className="transition-transform duration-200"
              style={{ transform: `translate(${gazeX * 0.7}px, ${gazeY * 0.6}px)` }}
            >
              {/* Left Eye */}
              <circle cx="112" cy="115" r="5.5" fill="#FFFFFF" />
              <circle cx="112" cy="115" r="2.8" fill="#18181B" />

              {/* Right Eye */}
              <circle cx="138" cy="115" r="5.5" fill="#FFFFFF" />
              <circle cx="138" cy="115" r="2.8" fill="#18181B" />
            </g>
          ) : (
            /* Shy closed eye lines when covering */
            <g opacity="0.5">
              <path d="M107 115 Q112 118 117 115" stroke="#4834D4" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M133 115 Q138 118 143 115" stroke="#4834D4" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* Mouth */}
          {hasError ? (
            <ellipse cx="125" cy="132" rx="4" ry="5" fill="#4834D4" />
          ) : isHidingEyes ? (
            <path d="M121 130 Q125 128 129 130" stroke="#4834D4" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M123 128 L127 128" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Purple Character Hands - Cover eyes during password entry */}
          <g
            className="transition-all duration-500 ease-in-out origin-bottom"
            style={{
              transform: isHidingEyes
                ? "translate(0px, 0px)"
                : isPeeking
                ? "translate(0px, 12px)"
                : "translate(0px, 80px)",
              opacity: isHidingEyes || isPeeking ? 1 : 0,
            }}
          >
            {/* Left Arm / Hand */}
            <path
              d="M84 145 C84 120, 102 105, 114 108 C119 110, 120 120, 115 125 C108 132, 94 138, 88 150 Z"
              fill="#5B48D9"
            />
            {/* Right Arm / Hand */}
            <path
              d="M166 145 C166 120, 148 105, 136 108 C131 110, 130 120, 135 125 C142 132, 156 138, 162 150 Z"
              fill="#5B48D9"
            />
          </g>
        </g>

        {/* ── 2. DARK CHARCOAL CHARACTER (Center-Right, Angled) ── */}
        <g
          className="transition-transform duration-500 ease-out"
          style={{
            transform: `rotate(-4deg) ${
              isSubmitting
                ? "translate(5px, 6px)"
                : isHidingEyes
                ? "translate(3px, -6px)"
                : `translate(${gazeX * 0.3}px, ${gazeY * 0.25}px)`
            }`,
            transformOrigin: "160px 355px",
          }}
        >
          {/* Main Charcoal Column */}
          <path
            d="M142 140 Q142 130 152 130 L186 130 Q196 130 196 140 L196 355 L142 355 Z"
            fill="#1E232A"
          />

          {/* Expressive Oval Eyes */}
          <g
            className="transition-transform duration-200"
            style={{
              transform: isHidingEyes
                ? "translate(-2px, -4px)"
                : `translate(${gazeX * 0.8}px, ${gazeY * 0.7}px)`,
            }}
          >
            {/* Left Eye */}
            <ellipse cx="160" cy="154" rx="6.5" ry="7" fill="#FFFFFF" />
            <circle
              cx={isHidingEyes ? 158 : 160 + Math.max(-3, Math.min(3, gazeX * 0.5))}
              cy={isHidingEyes ? 151 : 154 + Math.max(-3, Math.min(3, gazeY * 0.5))}
              r="3.2"
              fill="#18181B"
            />

            {/* Right Eye */}
            <ellipse cx="180" cy="154" rx="6.5" ry="7" fill="#FFFFFF" />
            <circle
              cx={isHidingEyes ? 178 : 180 + Math.max(-3, Math.min(3, gazeX * 0.5))}
              cy={isHidingEyes ? 151 : 154 + Math.max(-3, Math.min(3, gazeY * 0.5))}
              r="3.2"
              fill="#18181B"
            />
          </g>
        </g>

        {/* ── 3. YELLOW PILL / FINGER CHARACTER (Right) ── */}
        <g
          className="transition-transform duration-500 ease-out"
          style={{
            transform: isSubmitting
              ? "translateY(5px)"
              : isHidingEyes
              ? "translate(4px, 2px) rotate(3deg)"
              : `translate(${gazeX * 0.35}px, ${gazeY * 0.25}px)`,
            transformOrigin: "215px 355px",
          }}
        >
          {/* Main Yellow Body */}
          <path
            d="M178 200 C178 165, 222 165, 222 200 L222 355 L178 355 Z"
            fill="#F1C40F"
          />

          {/* Eye */}
          <g
            className="transition-transform duration-200"
            style={{
              transform: isHidingEyes
                ? "translate(4px, -2px)"
                : `translate(${gazeX * 0.6}px, ${gazeY * 0.5}px)`,
            }}
          >
            <circle cx="198" cy="188" r="3.5" fill="#18181B" />
          </g>

          {/* Horizontal Beak / Mouth Line */}
          <path
            d={isHidingEyes ? "M198 198 L226 198" : "M196 196 L224 196"}
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* ── 4. ORANGE DOME / BLOB CHARACTER (Front-Left) ── */}
        <g
          className="transition-transform duration-300 ease-out"
          style={{
            transform: isSubmitting
              ? "scaleY(0.96) translateY(12px)"
              : isHidingEyes
              ? "scale(0.98) translateY(2px)"
              : `translate(${gazeX * 0.4}px, ${gazeY * 0.3}px)`,
            transformOrigin: "115px 355px",
          }}
        >
          {/* Orange Half-Dome / Bean Body */}
          <path
            d="M48 355 C48 240, 185 240, 185 355 Z"
            fill="#FF7033"
          />

          {/* Face Elements */}
          <g
            className="transition-transform duration-200"
            style={{
              transform: isHidingEyes
                ? "translate(0px, -6px)"
                : `translate(${gazeX * 0.9}px, ${gazeY * 0.8}px)`,
            }}
          >
            {/* Left Eye */}
            <circle cx="106" cy="275" r="4" fill="#18181B" />

            {/* Right Eye */}
            <circle cx="132" cy="275" r="4" fill="#18181B" />

            {/* Smile / Mouth */}
            {hasError ? (
              <path
                d="M115 292 Q119 287 123 292"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : isHidingEyes ? (
              <ellipse cx="119" cy="289" rx="2.5" ry="3" fill="#18181B" />
            ) : (
              <path
                d="M114 286 Q119 292 124 286"
                stroke="#18181B"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
