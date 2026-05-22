export default function MedalBadge({ medal }) {
  if (!medal) return null;
  const map = { GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉" };
  return <span title={medal}>{map[medal] ?? null}</span>;
}