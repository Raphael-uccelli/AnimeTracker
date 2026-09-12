export function getSeasonInfo(startDate) {
  if (!startDate) {
    return { year: 0, seasonIndex: -1, chapterLabel: "Date inconnue", sortKey: -1 };
  }

  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  let seasonIndex;
  let seasonLabel;

  if (month <= 2) {
    seasonIndex = 0;
    seasonLabel = "Hiver";
  } else if (month <= 5) {
    seasonIndex = 1;
    seasonLabel = "Printemps";
  } else if (month <= 8) {
    seasonIndex = 2;
    seasonLabel = "Été";
  } else {
    seasonIndex = 3;
    seasonLabel = "Automne";
  }

  return {
    year,
    seasonIndex,
    chapterLabel: `${seasonLabel} ${year}`,
    sortKey: year * 10 + seasonIndex
  };
}

export function groupByChapters(animes) {
  const groups = new Map();

  animes.forEach((anime) => {
    const info = getSeasonInfo(anime.startDate);

    if (!groups.has(info.sortKey)) {
      groups.set(info.sortKey, {
        sortKey: info.sortKey,
        label: info.chapterLabel,
        animes: []
      });
    }

    groups.get(info.sortKey).animes.push(anime);
  });

  return Array.from(groups.values()).sort((a, b) => b.sortKey - a.sortKey);
}

export const SEASONS = [
  { key: "winter", label: "❄️ Hiver" },
  { key: "spring", label: "🌸 Printemps" },
  { key: "summer", label: "☀️ Été" },
  { key: "fall", label: "🍂 Automne" }
];