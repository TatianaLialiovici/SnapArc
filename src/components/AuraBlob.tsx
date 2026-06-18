/**
 * AuraBlob — the "captured light essence".
 * Pure CSS/SVG: layered radial gradients + blur + grain over an organic,
 * slowly morphing shape. No external assets. To overlay a real photo, set
 * the CSS var --aura-photo on the wrapper (e.g. url('/sample.jpg')) — it
 * blends in over the gradient and falls back gracefully when unset.
 */
export function AuraBlob({
  className = "",
  size = 320,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`aura-stage ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="aura-halo" />
      <div className="aura-blob" style={{ width: "100%", height: "100%" }}>
        <div className="aura-photo" />
        <div className="aura-grain" />
      </div>
    </div>
  );
}

/** A small animated waveform graphic. */
export function Waveform({ bars = 9, className = "" }: { bars?: number; className?: string }) {
  const heights = [10, 18, 26, 14, 22, 9, 20, 15, 24, 12, 19];
  return (
    <div className={`waveform ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            height: heights[i % heights.length],
            animationDelay: `${(i % heights.length) * 0.11}s`,
          }}
        />
      ))}
    </div>
  );
}
