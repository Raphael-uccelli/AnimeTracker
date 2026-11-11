import { useEffect, useRef, useState } from "react";

function AnimeDetailsModal({
  anime,
  onClose,
  onGoToSeason,
  isFavorite = false,
  onToggleFavorite,
  compact = false
}) {
  const lastTapRef = useRef(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  useEffect(() => {
    if (!showHeartPop) return;
    const timeout = setTimeout(() => setShowHeartPop(false), 700);
    return () => clearTimeout(timeout);
  }, [showHeartPop]);

  if (!anime) return null;

  function toggleFavorite() {
    if (!onToggleFavorite) return;
    if (!isFavorite) setShowHeartPop(true);
    onToggleFavorite(anime);
  }

  function handleDoubleTap() {
    if (!onToggleFavorite) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      toggleFavorite();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }

  const actions = (onToggleFavorite || onGoToSeason) && (
    <div className="modal-actions">
      {onToggleFavorite && (
        <button
          className={isFavorite ? "modal-btn favorite active" : "modal-btn favorite"}
          onClick={toggleFavorite}
        >
          {isFavorite ? "❤️ Dans tes favoris" : "♡ Ajouter aux favoris"}
        </button>
      )}

      {onGoToSeason && (
        <button className="modal-btn season" onClick={() => onGoToSeason(anime)}>
          📅 Aller à sa saison
        </button>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content compact"
          onClick={(event) => event.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>

          <div className="modal-media compact-header" onClick={handleDoubleTap}>
            {anime.image ? (
              <img
                className="compact-poster"
                src={anime.image}
                alt={`Image de ${anime.title}`}
                draggable={false}
              />
            ) : (
              <div className="compact-poster no-image">🎬</div>
            )}

            <div className="compact-info">
              <h2>{anime.title}</h2>

              {anime.japaneseTitle && (
                <p className="modal-subtitle">{anime.japaneseTitle}</p>
              )}

              <p>
                {anime.releaseDate} · {anime.episodes} épisodes
              </p>

              {anime.rating ? <p>⭐ {anime.rating.toFixed(1)}/10</p> : null}

              {anime.genres && anime.genres.length > 0 && (
                <p className="modal-genres">{anime.genres.join(" · ")}</p>
              )}
            </div>

            {showHeartPop && <div className="heart-pop-wrap css-anim">❤️</div>}
          </div>

          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-media" onClick={handleDoubleTap}>
          <img src={anime.image} alt={`Image de ${anime.title}`} />
          {showHeartPop && <div className="heart-pop-wrap css-anim">❤️</div>}
        </div>

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

        {actions}
      </div>
    </div>
  );
}

export default AnimeDetailsModal;