import { useRef } from "react";

function AnimeDetailsModal({ anime, onClose, onGoToSeason, isFavorite, onToggleFavorite }) {
  const lastTapRef = useRef(0);

  if (!anime) return null;

  function handleImageTap() {
    if (!onToggleFavorite) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onToggleFavorite(anime);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <img
          src={anime.image}
          alt={`Image de ${anime.title}`}
          onClick={handleImageTap}
        />

        <h2>{anime.title}</h2>

        {anime.japaneseTitle && (
          <p className="modal-subtitle">{anime.japaneseTitle}</p>
        )}

        <p>
          {anime.releaseDate} · {anime.episodes} épisodes
          {anime.rating ? ` · ⭐ ${anime.rating.toFixed(1)}/10` : ""}
        </p>

        {anime.genres && anime.genres.length > 0 && (
          <p className="modal-genres">{anime.genres.join(" · ")}</p>
        )}

        <p>{anime.synopsis}</p>

        <div className="modal-actions">
          {onToggleFavorite && (
            <button
              className="modal-favorite-button"
              onClick={() => onToggleFavorite(anime)}
            >
              {isFavorite ? "❤️ Retirer des favoris" : "♡ Ajouter aux favoris"}
            </button>
          )}

          {onGoToSeason && (
            <button
              className="start-button modal-go-to-season"
              onClick={() => onGoToSeason(anime)}
            >
              📅 Aller à sa saison
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnimeDetailsModal;