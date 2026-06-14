const BRANDS = [
  "toyota",
  "lexus",
  "peugeot",
  "volkswagen",
  "suzuki",
  "mazda",
  "mitsubishi",
  "renault",
  "changan",
  "bmw",
  "honda",
  "mercedes-benz",
  "mg",
  "volvo",
];

const ROWS = [
  { top: "6.0%", anim: "gridL", dur: "60s" },
  { top: "18.57%", anim: "gridR", dur: "70s" },
  { top: "31.14%", anim: "gridL", dur: "80s" },
  { top: "43.71%", anim: "gridR", dur: "90s" },
  { top: "56.29%", anim: "gridL", dur: "100s" },
  { top: "68.86%", anim: "gridR", dur: "110s" },
  { top: "81.43%", anim: "gridL", dur: "120s" },
  { top: "94.0%", anim: "gridR", dur: "130s" },
];

export default function BackgroundGrid() {
  return (
    <div className="bggrid" aria-hidden="true">
      {ROWS.map((r, i) => {
        const offset = i % BRANDS.length;
        const rotated = [...BRANDS.slice(offset), ...BRANDS.slice(0, offset)];
        const doubled = [...rotated, ...rotated];
        return (
          <div
            key={i}
            className="grow"
            style={{ top: r.top, animation: `${r.anim} ${r.dur} linear infinite` }}
          >
            <div className="gstrip">
              {doubled.map((b, j) => (
                <span className="gslot" key={j}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/brands/${b}.png`} alt="" />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
