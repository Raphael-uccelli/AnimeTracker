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

  return data.map(mapAnimeForUi);
}