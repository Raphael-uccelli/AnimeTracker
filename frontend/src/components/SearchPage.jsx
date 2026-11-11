import { useMemo, useState } from "react";
import AnimeDetailsModal from "./AnimeDetailsModal";

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function SearchPage({ animes, animeStatuses, onBack, onToggleFavorite }) {
  const [query, setQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);

  const normalizedQuery = normalizeText(query);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return animes.filter(
      (anime) =>
        normalizeText(anime.title).includes(normalizedQuery) ||
        normalizeText(anime.japaneseTitle).includes(normalizedQuery)
    );
  }, [animes, normalizedQuery]);

  function getStatusLabel(anime) {
    const status = animeStatuses.find((s) => s.animeId === anime.id);
    const labels = [];

    if (status?.status === "WATCHED") labels.push("👁️ Vu");
    if (status?.status === "NOT_INTERESTED") labels.push("❌ Pas intéressé");
    if (status?.favorite) labels.push("⭐ Favori");
    if (labels.length === 0) labels.push("🔄 Pas encore swipé");

    return labels.join(" · ");
  }

  const selectedIsFavorite = selectedAnime
    ? animeStatuses.some((s) => s.animeId === selectedAnime.id && s.favorite)
    : false;

  return (
    <div>
      <button onClick={onBack} className="back-button">
        ↩️ Retour
      </button>

      <h2>🔍 Recherche dans la saison</h2>

      <input
        type="text"
        placeholder="Nom de l'anime..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="search-input"
        autoFocus
      />

      <p className="search-hint">
        {normalizedQuery
          ? `${results.length} résultat(s) sur ${animes.length} animés de cette saison`
          : `Recherche dans les ${animes.length} animés de la saison affichée.`}
      </p>

      {normalizedQuery && results.length === 0 && (
        <p>Aucun résultat pour "{query}".</p>
      )}

      <ul className="favorites-list">
        {results.map((anime) => (
          <li
            key={anime.id}
            className="favorite-item"
            onClick={() => setSelectedAnime(anime)}
          >
            <img src={anime.image} alt={`Image de ${anime.title}`} />
            <div className="favorite-item-text">
              <h3>{anime.title}</h3>
              <p>
                {anime.releaseDate} · {getStatusLabel(anime)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <AnimeDetailsModal
        anime={selectedAnime}
        onClose={() => setSelectedAnime(null)}
        isFavorite={selectedIsFavorite}
        onToggleFavorite={onToggleFavorite}
        compact
      />
    </div>
  );
}

export default SearchPage;