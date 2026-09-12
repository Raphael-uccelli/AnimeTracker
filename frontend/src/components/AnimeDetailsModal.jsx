function AnimeDetailsModal({ anime, onClose }) {
  if (!anime) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <img src={anime.image} alt={`Image de ${anime.title}`} />

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
      </div>
    </div>
  );
}

export default AnimeDetailsModal;