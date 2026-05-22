export function medalBadgeStyle(medal) {
  if (medal === "GOLD")   return { background: "rgba(251,191,36,0.15)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.4)"  };
  if (medal === "SILVER") return { background: "rgba(148,163,184,0.15)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.4)" };
  if (medal === "BRONZE") return { background: "rgba(180,83,9,0.2)",     color: "#d97706", border: "1px solid rgba(180,83,9,0.4)"    };
  return {};
}