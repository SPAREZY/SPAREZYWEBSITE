// SPAREZY animated 3D header logo.
// Converted from a self-contained HTML snippet: `class` -> `className`,
// inline `style="..."` strings -> JSX style objects, and the two
// `@keyframes` (sparezy-sway, sparezy-shine) moved into app/globals.css.
//
// The logo is built from stacked layers of one shared PNG to fake 3D depth:
// 28 dimmed/desaturated "depth" copies behind a full-color top copy, plus a
// masked sweeping highlight. The base64 image and both animations are intact.
import type { CSSProperties } from "react";

const LOGO_SRC =
  "/sparezy-logo-3d.png";

// [translateZ in px, brightness] for each depth layer, back (most negative
// Z, darkest) to front. Kept exactly as in the original snippet.
const DEPTH_LAYERS: ReadonlyArray<readonly [number, number]> = [
  [-42.0, 0.55],
  [-40.5, 0.56],
  [-39.0, 0.57],
  [-37.5, 0.58],
  [-36.0, 0.59],
  [-34.5, 0.61],
  [-33.0, 0.62],
  [-31.5, 0.63],
  [-30.0, 0.64],
  [-28.5, 0.65],
  [-27.0, 0.66],
  [-25.5, 0.67],
  [-24.0, 0.68],
  [-22.5, 0.69],
  [-21.0, 0.71],
  [-19.5, 0.72],
  [-18.0, 0.73],
  [-16.5, 0.74],
  [-15.0, 0.75],
  [-13.5, 0.76],
  [-12.0, 0.77],
  [-10.5, 0.78],
  [-9.0, 0.79],
  [-7.5, 0.81],
  [-6.0, 0.82],
  [-4.5, 0.83],
  [-3.0, 0.84],
  [-1.5, 0.85],
];

const layerBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

type SparezyLogoProps = {
  /** Rendered width of the logo. Defaults to the header size. */
  width?: number | string;
  /** Upper bound so it stays responsive in narrow containers. */
  maxWidth?: number | string;
};

export default function SparezyLogo({
  width = 285,
  maxWidth = "52.25vw",
}: SparezyLogoProps = {}) {
  return (
    <div style={{ textAlign: "center", background: "transparent", perspective: "850px" }}>
      <div
        className="sz-logo"
        style={{
          display: "inline-block",
          position: "relative",
          width,
          maxWidth,
          aspectRatio: "1200 / 430",
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          animation: "sparezy-sway 6s ease-in-out infinite",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.18))",
        }}
      >
        {DEPTH_LAYERS.map(([z, brightness]) => (
          <img
            key={z}
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            style={{
              ...layerBase,
              transform: `translateZ(${z}px)`,
              filter: `brightness(${brightness}) saturate(0)`,
            }}
          />
        ))}

        <img
          src={LOGO_SRC}
          alt="SPAREZY Auto Spare Parts"
          style={{ ...layerBase, transform: "translateZ(1.5px)" }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            transform: "translateZ(2.1px)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            WebkitMaskImage: `url("${LOGO_SRC}")`,
            maskImage: `url("${LOGO_SRC}")`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            background:
              "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.85) 50%, transparent 65%)",
            backgroundSize: "300% 100%",
            animation: "sparezy-shine 6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
