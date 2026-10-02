import { useRef } from "react";
import { motion } from "framer-motion";

function AnimeCard({ anime, onSeen, onNotInterested, onFavorite, isFavorite }) {
  const cardRef = useRef(null);

  function handleDragEnd(event, info) {
    const cardWidth = cardRef.current?.offsetWidth || 300;
    const offsetThreshold = cardWidth * 0.35; // 35% de la largeur de la carte
    const velocityThreshold = 500; // px/s — détecte un "flick" rapide

    const swipedRight =
      info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold;
    const swipedLeft =
      info.offset.x < -offsetThreshold || info.velocity.x < -velocityThreshold;

    if (swipedRight) {
      onSeen();
    } else if (swipedLeft) {
      onNotInterested();
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="anime-card"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, rotate: 2 }}
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