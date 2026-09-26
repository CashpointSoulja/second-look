// Playful decoration inspired by Y2K pixel mosaics, pink star bursts and neon plus stickers.
// Purely decorative: aria-hidden, pointer-events none.

const STAR = "M12 1.5l3.1 6.9 7.4.7-5.6 5 1.6 7.4L12 17.8l-6.5 3.7 1.6-7.4-5.6-5 7.4-.7z";

export function StarBurst({ className = "", color = "#ff2d95" }: { className?: string; color?: string }) {
  const rings = [
    { r: 44, s: 13, n: 8, o: 0 },
    { r: 30, s: 9, n: 8, o: 22.5 },
    { r: 18, s: 6, n: 8, o: 0 },
  ];
  return (
    <svg viewBox="-60 -60 120 120" className={`pointer-events-none ${className}`} aria-hidden>
      <g className="spin-slow" style={{ transformOrigin: "center" }}>
        {rings.flatMap((ring) =>
          Array.from({ length: ring.n }, (_, i) => {
            const a = ((360 / ring.n) * i + ring.o) * (Math.PI / 180);
            const x = Math.sin(a) * ring.r;
            const y = -Math.cos(a) * ring.r;
            return (
              <path
                key={`${ring.r}-${i}`}
                d={STAR}
                fill={color}
                transform={`translate(${x - ring.s / 2} ${y - ring.s / 2}) scale(${ring.s / 24}) rotate(${(360 / ring.n) * i + ring.o} 12 12)`}
              />
            );
          }),
        )}
      </g>
    </svg>
  );
}

export function PlusSticker({ color, className = "", style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={`pointer-events-none ${className}`} style={style} aria-hidden>
      <circle cx="20" cy="20" r="16.5" fill="none" stroke={color} strokeWidth="4" />
      <path d="M20 10v20M10 20h20" stroke={color} strokeWidth="5" />
    </svg>
  );
}

/** Deterministic pixel mosaic (no randomness, so server and client render the same). */
export function PixelField({ cols = 10, rows = 6, className = "" }: { cols?: number; rows?: number; className?: string }) {
  const cells = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const v = (x * 7 + y * 13 + x * y) % 11;
      if (v < 5) cells.push({ x, y, c: v % 2 ? "#4d6bff" : "#ffe34d" });
    }
  return (
    <svg viewBox={`0 0 ${cols * 10} ${rows * 10}`} className={`pointer-events-none ${className}`} aria-hidden>
      {cells.map(({ x, y, c }, i) => (
        <rect key={i} x={x * 10 + 1} y={y * 10 + 1} width="8" height="8" fill={c} className="pixel-twinkle" style={{ animationDelay: `${(i % 9) * 0.35}s` }} />
      ))}
    </svg>
  );
}

/** Stars that fly out once when a verdict lands. */
export function StarPop({ color }: { color: string }) {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="star-pop absolute left-1/2 top-1/2 h-4 w-4"
          style={{ "--a": `${i * 36}deg`, animationDelay: `${i * 18}ms` } as React.CSSProperties}
        >
          <path d={STAR} fill={i % 3 === 0 ? "#ffe34d" : color} />
        </svg>
      ))}
    </span>
  );
}
