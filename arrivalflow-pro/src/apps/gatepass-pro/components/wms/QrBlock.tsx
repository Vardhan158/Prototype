export function QrBlock({ value, size = 168 }: { value: string; size?: number }) {
  // Deterministic pseudo-QR pattern rendered from the payload (prototype visual).
  const n = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) % 100000;
  const cells: boolean[] = [];
  let s = seed || 7;
  for (let i = 0; i < n * n; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    cells.push((s >> 16) % 2 === 0);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  return (
    <div
      role="img"
      aria-label={`QR gate pass ${value}`}
      className="grid rounded-xl bg-white p-3"
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${n}, 1fr)` }}
    >
      {cells.map((on, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        const finder = isFinder(r, c);
        const ring =
          finder &&
          ((r % 7 === 0 || r % 7 === 6 || c % 7 === 0 || c % 7 === 6) ||
            (r % 7 >= 2 && r % 7 <= 4 && c % 7 >= 2 && c % 7 <= 4));
        const dark = finder ? ring : on;
        return <span key={i} className={dark ? "bg-[oklch(0.15_0.02_265)]" : "bg-transparent"} />;
      })}
    </div>
  );
}