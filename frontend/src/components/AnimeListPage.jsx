import { useState } from "react";
import AnimeDetailsModal from "./AnimeDetailsModal";
import { groupByChapters } from "../utils/season";

function AnimeListPage({
  title,
  animes,
  emptyMessage,
  onBack,
  enablePin = false,
  pinnedIds = [],
  onTogglePin
}) {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredAnimes = normalizedQuery
    ? animes.filter((anime) => anime.title?.toLowerCase().includes(normalizedQuery))
    : animes;

  const pinnedAnimes = enablePin
    ? filteredAnimes.filter((anime) => pinnedIds.includes(anime.id))
    : [];

  const remainingAnimes = enablePin
    ? filteredAnimes.filter((anime) => !pinnedIds.includes(anime.id))
    : filteredAnimes;

  const chapters = groupByChapters(remainingAnimes);

  function handlePinClick(event, animeId) {
    event.stopPropagation();
    onTogglePin(animeId);
  }

  return (
    <div>
      <button onClick={onBack} className="back-button">
        ↩️ Retour
      </button>

      <div className="list-header">
        <h2>{title}</h2>

        <div className="view-toggle">
          <button
            className={viewMode === "list" ? "view-toggle-btn active" : "view-toggle-btn"}
            onClick={() => setViewMode("list")}
            title="Vue liste"
          >
            ☰
          </button>
          <button
            className={viewMode === "grid" ? "view-toggle-btn active" : "view-toggle-btn"}
            onClick={() => setViewMode("grid")}
            title="Vue grille"
          >
            ▦
          </button>
        </div>
      </div>

      {animes.length > 0 && (
        <input
          type="text"
          placeholder="Rechercher dans cette liste..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="search-input"
        />
      )}

      {animes.length === 0 && <p>{emptyMessage}</p>}

      {animes.length > 0 && filteredAnimes.length === 0 && (
        <p>Aucun résultat pour "{searchQuery}".</p>
      )}

      {enablePin && pinnedAnimes.length > 0 && (
        <div className="pinned-section">
          <h3 className="section-title">📌 Épinglés</h3>
          <div className="pinned-strip">
            {pinnedAnimes.map((anime) => (
              <div
                key={anime.id}
                className="pinned-item"
                onClick={() => setSelectedAnime(anime)}
              >
                <img src={anime.image} alt={`Image de ${anime.title}`} />
                <button
                  className="pin-badge active pinned-item-badge"
                  onClick={(event) => handlePinClick(event, anime.id)}
                  title="Désépingler"
                >
                  📌
                </button>
                <p>{anime.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {chapters.map((chapter) => (
        <div key={chapter.sortKey} className="chapter-group">
          <div className="chapter-divider">
            <span>{chapter.label}</span>
          </div>

          {viewMode === "list" && (
            <ul className="favorites-list">
              {chapter.animes.map((anime) => (
                <li
                  key={anime.id}
                  className="favorite-item"
                  onClick={() => setSelectedAnime(anime)}
                >
                  <img src={anime.image} alt={`Image de ${anime.title}`} />
                  <div className="favorite-item-text">
                    <h3>{anime.title}</h3>
                    <p>
                      {anime.releaseDate} · {anime.episodes} épisodes
                    </p>
                  </div>

                  {enablePin && (
                    <button
                      className="pin-badge list-pin"
                      onClick={(event) => handlePinClick(event, anime.id)}
                      title="Épingler"
                    >
                      📌
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {viewMode === "grid" && (
            <div className="anime-grid">
              {chapter.animes.map((anime) => (
                <div
                  key={anime.id}
                  className="grid-item"
                  onClick={() => setSelectedAnime(anime)}
                >
                  <img src={anime.image} alt={`Image de ${anime.title}`} />
                  <div className="grid-item-info">
                    <p className="grid-item-title">{anime.title}</p>

                    {enablePin && (
                      <button
                        className="grid-pin-button"
                        onClick={(event) => handlePinClick(event, anime.id)}
                      >
                        📌 Épingler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <AnimeDetailsModal
        anime={selectedAnime}
        onClose={() => setSelectedAnime(null)}
      />
    </div>
  );
}

export default AnimeListPage;