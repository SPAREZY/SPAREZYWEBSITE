import type { ReactNode } from "react";

/**
 * Hand-drawn line-art icons for common auto parts, plus a keyword matcher.
 * Icons use currentColor so they inherit the tile's text color.
 */

type IP = { className?: string };

function S({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

const Radiator = (p: IP) => (
  <S className={p.className}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="M7 5v14M11 5v14M15 5v14M19 5v14" />
    <path d="M6 5V3.4h3M21 9h1.4M21 13h1.4" />
  </S>
);
const Brake = (p: IP) => (
  <S className={p.className}>
    <circle cx="10.5" cy="12" r="7.5" />
    <circle cx="10.5" cy="12" r="2.6" />
    <path d="M10.5 4.8v1.4M10.5 17.8v1.4M3.4 12h1.4M16.2 12h1.4" />
    <rect x="15.5" y="9" width="3.6" height="6" rx="1.2" />
    <path d="M15.5 12H17" />
  </S>
);
const Headlight = (p: IP) => (
  <S className={p.className}>
    <path d="M4 5h6a7 7 0 0 1 0 14H4z" />
    <path d="M19.5 9h2.6M19.5 12h2.6M19.5 15h2.6" />
  </S>
);
const Bulb = (p: IP) => (
  <S className={p.className}>
    <path d="M9.5 17.5h5M10.5 20.5h3" />
    <path d="M12 3.5a6 6 0 0 0-3.7 10.7c.7.6 1.2 1.3 1.2 2.3h5c0-1 .5-1.7 1.2-2.3A6 6 0 0 0 12 3.5z" />
  </S>
);
const Battery = (p: IP) => (
  <S className={p.className}>
    <rect x="3" y="7" width="18" height="11" rx="1.5" />
    <path d="M7 7V5h3v2M14 7V5h3v2" />
    <path d="M7 12.5h2.6M8.3 11.2v2.6M14.4 12.5H17" />
  </S>
);
const Steering = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.3" />
    <path d="M12 14.3v6.2M5.4 9.6l4.4 1.4M18.6 9.6l-4.4 1.4" />
  </S>
);
const Tire = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </S>
);
const Filter = (p: IP) => (
  <S className={p.className}>
    <path d="M3.5 5h17l-6.3 7.3V20l-4-2.2v-5.5z" />
    <path d="M8 8.2h8" />
  </S>
);
const Oil = (p: IP) => (
  <S className={p.className}>
    <path d="M12 3.2c0 0 6.4 6.9 6.4 11.2a6.4 6.4 0 0 1-12.8 0C5.6 10.1 12 3.2 12 3.2z" />
    <path d="M12 17.6a3 3 0 0 1-3-3" />
  </S>
);
const SparkPlug = (p: IP) => (
  <S className={p.className}>
    <path d="M10 2.5h4v3h-4z" />
    <path d="M9.2 5.5h5.6l-.8 4.2H10z" />
    <path d="M10.4 9.7l-.4 6.3M13.6 9.7l.2 4.3" />
    <path d="M11 19.6h3" />
  </S>
);
const Starter = (p: IP) => (
  <S className={p.className}>
    <rect x="3.5" y="8" width="10" height="8" rx="2" />
    <path d="M6 8v8M9 8v8" />
    <circle cx="17.5" cy="12" r="3.4" />
    <path d="M17.5 8v-.8M17.5 16.8v-.8M13.3 12h.8M21.7 12h-.8" />
  </S>
);
const Alternator = (p: IP) => (
  <S className={p.className}>
    <rect x="4.5" y="7" width="11" height="10" rx="2" />
    <path d="M7 7v10M10 7v10M13 7v10" />
    <circle cx="18.6" cy="12" r="2.3" />
    <path d="M15.5 12h.9" />
  </S>
);
const Mirror = (p: IP) => (
  <S className={p.className}>
    <rect x="4.5" y="4.5" width="10" height="8" rx="2.5" />
    <path d="M14.5 8.5h3.6V18" />
    <path d="M7.2 7.6l4.4 2.6" />
  </S>
);
const Wiper = (p: IP) => (
  <S className={p.className}>
    <circle cx="4.2" cy="19.8" r="1.3" />
    <path d="M4.8 19.2 16 8" />
    <path d="M13.2 5.2l3.6 3.6-1.6 1.6-3.6-3.6z" />
  </S>
);
const Shock = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="3.4" r="1.3" />
    <circle cx="12" cy="20.6" r="1.3" />
    <path d="M12 4.7v2M12 17.3v2" />
    <path d="M9 6.7l6 2-6 2 6 2-6 2 6 2" />
  </S>
);
const Exhaust = (p: IP) => (
  <S className={p.className}>
    <rect x="3" y="9.5" width="9" height="5" rx="2.5" />
    <path d="M6 9.5v5M9 9.5v5" />
    <path d="M12 12h3l2-1.4h3.5" />
    <path d="M20.5 10.6v2.8" />
  </S>
);
const Clutch = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 5v2.6M12 16.4V19M5 12h2.6M16.4 12H19M7 7l1.8 1.8M15.2 15.2 17 17M17 7l-1.8 1.8M7 17l1.8-1.8" />
  </S>
);
const Gears = (p: IP) => (
  <S className={p.className}>
    <circle cx="9.5" cy="9.5" r="4.3" />
    <circle cx="9.5" cy="9.5" r="1.4" />
    <path d="M9.5 4.2v1.4M9.5 13.4v1.4M4.2 9.5h1.4M13.4 9.5h1.4M6 6l1 1M12 12l1 1M13 6l-1 1M6 13l1-1" />
    <circle cx="16.5" cy="16.5" r="3" />
    <circle cx="16.5" cy="16.5" r="1" />
    <path d="M16.5 12.7v1M16.5 19.3v1M12.7 16.5h1M19.3 16.5h1" />
  </S>
);
const Belt = (p: IP) => (
  <S className={p.className}>
    <path d="M6.5 7.5h11a4.5 4.5 0 0 1 0 9h-11a4.5 4.5 0 0 1 0-9z" />
    <circle cx="6.5" cy="12" r="2" />
    <circle cx="17.5" cy="12" r="2" />
    <path d="M8 7.5v-1M11 7.5v-1M14 7.5v-1M8 16.5v1M11 16.5v1M14 16.5v1" />
  </S>
);
const Pump = (p: IP) => (
  <S className={p.className}>
    <circle cx="11" cy="12.5" r="6" />
    <path d="M11 9v7M7.5 12.5h7" />
    <path d="M11 6.5V4.5h3v2" />
    <path d="M17 10h3v3" />
  </S>
);
const Sensor = (p: IP) => (
  <S className={p.className}>
    <rect x="4.5" y="9" width="7" height="6" rx="1.5" />
    <path d="M6.5 15v3M11.5 12h2.4" />
    <path d="M16 9.4a4.5 4.5 0 0 1 0 5.2M18 7.6a7.5 7.5 0 0 1 0 8.8" />
  </S>
);
const Fan = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 10c0-3.4-1-5.4-4-5.8 1 2.9 1.4 4.8 4 5.8z" />
    <path d="M14 12c3.4 0 5.4-1 5.8-4-2.9 1-4.8 1.4-5.8 4z" />
    <path d="M12 14c0 3.4 1 5.4 4 5.8-1-2.9-1.4-4.8-4-5.8z" />
    <path d="M10 12c-3.4 0-5.4 1-5.8 4 2.9-1 4.8-1.4 5.8-4z" />
  </S>
);
const Ac = (p: IP) => (
  <S className={p.className}>
    <path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8" />
    <path d="M12 5.4 10 3.4M12 5.4 14 3.4M12 18.6l-2 2M12 18.6l2 2" />
    <path d="M5.1 8.7 5 6.1l2.3.6M18.9 15.3l.1 2.6-2.3-.6M18.9 8.7 19 6.1l-2.3.6M5.1 15.3 5 17.9l2.3-.6" />
  </S>
);
const Engine = (p: IP) => (
  <S className={p.className}>
    <path d="M4 16v-4h2V9.5h4V7.5h3v2h4l2 2v4.5z" />
    <path d="M7.5 9.5v-2h2M8 16v-2M12 16v-3M16 16v-2" />
  </S>
);
const Bumper = (p: IP) => (
  <S className={p.className}>
    <path d="M3 11c3-2.6 15-2.6 18 0v4.6a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 15.6z" />
    <path d="M3 13.6h18" />
  </S>
);
const Windshield = (p: IP) => (
  <S className={p.className}>
    <path d="M5 16l2.5-8.5h9L19 16z" />
    <path d="M12 7.5V16M5 16h14" />
  </S>
);
const Door = (p: IP) => (
  <S className={p.className}>
    <rect x="6" y="4" width="12" height="16" rx="1.6" />
    <path d="M9 7h6v4H9z" />
    <path d="M14.5 14H16" />
  </S>
);
const Fender = (p: IP) => (
  <S className={p.className}>
    <path d="M2 17V13c3-4 15-4 19 0v4" />
    <path d="M2 17h4.2a3.8 3.8 0 0 1 7.6 0H21" />
    <circle cx="10" cy="17" r="2.4" />
  </S>
);
const Cog = (p: IP) => (
  <S className={p.className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 4v2.6M12 17.4V20M4 12h2.6M17.4 12H20M6 6l1.9 1.9M16.1 16.1 18 18M18 6l-1.9 1.9M6 18l1.9-1.9" />
  </S>
);

type Entry = { key: string; label: string; keys: string[]; Icon: (p: IP) => JSX.Element };

// Order matters: more specific entries first.
const TABLE: Entry[] = [
  { key: "radiator", label: "Radiator", keys: ["radiator", "rad core", "intercooler"], Icon: Radiator },
  { key: "headlight", label: "Headlight", keys: ["headlight", "head light", "headlamp", "head lamp", "fog", "drl", "projector", "tail light", "taillight", "tail lamp", "xenon"], Icon: Headlight },
  { key: "bulb", label: "Light", keys: ["bulb", "led", "light", "lamp", "indicator", "signal", "blinker"], Icon: Bulb },
  { key: "battery", label: "Battery", keys: ["battery", "batt"], Icon: Battery },
  { key: "steering", label: "Steering", keys: ["steering", "steer", "tie rod", "rack"], Icon: Steering },
  { key: "clutch", label: "Clutch", keys: ["clutch", "flywheel", "pressure plate"], Icon: Clutch },
  { key: "brake", label: "Brakes", keys: ["brake", "pad", "rotor", "disc", "disk", "caliper"], Icon: Brake },
  { key: "tire", label: "Tire", keys: ["tire", "tyre", "wheel", "rim", "alloy", "hub", "bearing"], Icon: Tire },
  { key: "filter", label: "Filter", keys: ["filter"], Icon: Filter },
  { key: "oil", label: "Fluid", keys: ["oil", "fluid", "coolant", "lubricant", "grease", "antifreeze"], Icon: Oil },
  { key: "spark", label: "Spark Plug", keys: ["spark", "glow plug", "ignition coil", "plug"], Icon: SparkPlug },
  { key: "starter", label: "Starter", keys: ["starter"], Icon: Starter },
  { key: "alternator", label: "Alternator", keys: ["alternator", "dynamo"], Icon: Alternator },
  { key: "mirror", label: "Mirror", keys: ["mirror"], Icon: Mirror },
  { key: "wiper", label: "Wiper", keys: ["wiper", "blade"], Icon: Wiper },
  { key: "shock", label: "Suspension", keys: ["shock", "absorber", "strut", "suspension", "coilover", "spring", "damper", "control arm"], Icon: Shock },
  { key: "exhaust", label: "Exhaust", keys: ["exhaust", "muffler", "silencer", "catalytic", "downpipe", "manifold"], Icon: Exhaust },
  { key: "gears", label: "Transmission", keys: ["transmission", "gearbox", "gear", "cvt", "differential", "diff", "axle", "cv joint", "driveshaft"], Icon: Gears },
  { key: "belt", label: "Belt", keys: ["belt", "serpentine", "timing", "chain", "tensioner"], Icon: Belt },
  { key: "pump", label: "Pump", keys: ["pump"], Icon: Pump },
  { key: "sensor", label: "Sensor", keys: ["sensor", "o2", "oxygen", "maf", "abs", "camera", "parking", "radar"], Icon: Sensor },
  { key: "fan", label: "Fan", keys: ["fan"], Icon: Fan },
  { key: "ac", label: "A/C", keys: ["compressor", "condenser", "a/c", "air con", "aircon", "air condition", "evaporator", "expansion valve"], Icon: Ac },
  { key: "engine", label: "Engine", keys: ["engine", "motor", "cylinder", "piston", "crank", "valve", "camshaft", "gasket", "head", "turbo", "intake", "throttle", "injector"], Icon: Engine },
  { key: "bumper", label: "Bumper", keys: ["bumper"], Icon: Bumper },
  { key: "windshield", label: "Glass", keys: ["windshield", "windscreen", "glass", "window", "sunroof"], Icon: Windshield },
  { key: "door", label: "Door", keys: ["door", "handle", "lock", "latch", "hinge"], Icon: Door },
  { key: "fender", label: "Body Panel", keys: ["fender", "wing", "quarter", "panel", "hood", "bonnet", "grille", "grill", "trunk", "boot"], Icon: Fender },
  { key: "horn", label: "Horn", keys: ["horn"], Icon: Bulb },
];

export type PartMatch = { key: string; label: string; icon: ReactNode };

export function matchPart(name: string): PartMatch {
  const n = name.toLowerCase();
  for (const e of TABLE) {
    if (e.keys.some((k) => n.includes(k))) {
      const Icon = e.Icon;
      return { key: e.key, label: e.label, icon: <Icon className="pc-svg" /> };
    }
  }
  return { key: "part", label: "Part", icon: <Cog className="pc-svg" /> };
}
