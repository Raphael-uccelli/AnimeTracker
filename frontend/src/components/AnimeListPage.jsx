import { useState } from "react";
import AnimeDetailsModal from "./AnimeDetailsModal";
import { groupByChapters } from "../utils/season";

function AnimeListPage({ title, animes, emptyMessage, onBack }) {
  const [selectedAnime, setSelectedAnime] = useState(null);
  const chapters = groupByChapters(animes);

  return (
    <div>
      <button onClick={onBack} className="back-button">
        ↩️ Retour
      </button>

      <h2>{title}</h2>

      {animes.length === 0 && <p>{emptyMessage}</p>}

      {chapters.map((chapter) => (
        <div key={chapter.sortKey} className="chapter-group">
          <div className="chapter-divider">
            <span>{chapter.label}</span>
          </div>

          <ul className="favorites-list">
            {chapter.animes.map((anime) => (
              <li
                key={anime.id}
                className="favorite-item"
                onClick={() => setSelectedAnime(anime)}
              >
                <img src={anime.image} alt={`Image de ${anime.title}`} />
                <div>
                  <h3>{anime.title}</h3>
                  <p>
                    {anime.releaseDate} · {anime.episodes} épisodes
                  </p>
                </div>
              </li>
            ))}
          </ul>
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