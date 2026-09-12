import { useState } from "react";
import AnimeDetailsModal from "./AnimeDetailsModal";

function SearchPage({ animes, animeStatuses, onBack }) {
  const [query, setQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);

  const normalizedQuery = query.trim().toLowerCase();

  const results = normalizedQuery
    ? animes.filter((anime) =>
        anime.title?.toLowerCase().includes(normalizedQuery)
      )
    : [];

  function getStatusLabel(anime) {
    const status = animeStatuses.find((s) => s.animeId === anime.id);
    const labels = [];

    if (status?.status === "WATCHED") labels.push("👁️ Vu");
    if (status?.status === "NOT_INTERESTED") labels.push("❌ Pas intéressé");
    if (status?.favorite) labels.push("⭐ Favori");
    if (labels.length === 0) labels.push("🔄 Pas encore swipé");

    return labels.join(" · ");
  }

  return (
    <div>
      <button onClick={onBack} className="back-button">
        ↩️ Retour
      </button>

      <h2>🔍 Recherche</h2>

      <input
        type="text"
        placeholder="Nom de l'anime..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="search-input"
        autoFocus
      />

      <p className="search-hint">
        Recherche dans la saison actuellement chargée et dans tout ce que tu as déjà trié.
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
            <div>
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
      />
    </div>
  );
}

export default SearchPage;