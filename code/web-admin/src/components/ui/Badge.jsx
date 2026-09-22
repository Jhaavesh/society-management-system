export function Badge({ children, tone = "blue", className = "" }) {
  const tones = {
    blue: "badge-blue",
    mint: "badge-mint",
    amber: "badge-amber",
    rose: "badge-rose",
    gray: "badge-gray",
  };

  return (
    <span className={`badge ${tones[tone] || tones.blue} ${className}`}>
      {children}
    </span>
  );
}
