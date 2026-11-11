const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function mapAnimeForUi(anime) {
  let year = "Inconnue";
  let releaseDate = "Date inconnue";

  if (anime.startDate) {
    const parsedDate = new Date(anime.startDate);
    year = parsedDate.getFullYear();
    releaseDate = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric"
    }).format(parsedDate);
  }

  return {
    ...anime,
    year,
    releaseDate,
    episodes: anime.episodes ?? "?",
    synopsis: anime.description ?? "Pas de synopsis disponible."
  };
}

// Sécurité : garantit qu'un même id n'apparaît qu'une fois (clés React uniques)
function dedupeById(list) {
  const seen = new Set();

  return list.filter((anime) => {
    if (seen.has(anime.id)) return false;
    seen.add(anime.id);
    return true;
  });
}

export async function fetchAnimesForSeason(year, season) {
  const response = await fetch(
    `${API_BASE_URL}/api/anime/season?year=${year}&season=${season}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Format de reponse invalide");
  }

  return dedupeById(data).map(mapAnimeForUi);
}

export async function fetchAnimeSearch(query) {
  const response = await fetch(
    `${API_BASE_URL}/api/anime/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Format de reponse invalide");
  }

  return dedupeById(data).map(mapAnimeForUi);
}