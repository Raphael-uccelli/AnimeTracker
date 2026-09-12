import { motion } from "framer-motion";

function AnimeCard({ anime, onSeen, onNotInterested, onFavorite, isFavorite }) {
  function handleDragEnd(event, info) {
    if (info.offset.x > 120) {
      onSeen();
    } else if (info.offset.x < -120) {
      onNotInterested();
    }
  }

  return (
    <motion.div
      className="anime-card"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.03, rotate: 3 }}
    >
      <div className="anime-card-image">
        <img
          src={anime.image}
          alt={`Image de ${anime.title}`}
          draggable={false}
        />
      </div>

      <div className="anime-card-content">
        <h2>{anime.title}</h2>
        <p className="anime-meta">
          {anime.releaseDate} · {anime.episodes} épisodes
        </p>

        <div className="anime-synopsis">
          <p>{anime.synopsis}</p>
        </div>

        <div className="anime-card-actions">
          <button onClick={onNotInterested} className="action-btn reject">
            ❌
          </button>

          <button onClick={onSeen} className="action-btn seen">
            👁️
          </button>

          <button onClick={onFavorite} className="action-btn favorite">
            {isFavorite ? "❤️" : "♡"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default AnimeCard;