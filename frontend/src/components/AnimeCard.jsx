import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function AnimeCard({ anime, onSeen, onNotInterested, onFavorite, isFavorite }) {
  const cardRef = useRef(null);
  const lastTapRef = useRef(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  useEffect(() => {
    if (!showHeartPop) return;
    const timeout = setTimeout(() => setShowHeartPop(false), 700);
    return () => clearTimeout(timeout);
  }, [showHeartPop]);

  function handleDragEnd(event, info) {
    const cardWidth = cardRef.current?.offsetWidth || 300;
    const offsetThreshold = cardWidth * 0.35;
    const velocityThreshold = 500;

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

  function handleTap() {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      onFavorite();
      setShowHeartPop(true);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }

  function handleActionClick(event, action) {
    event.stopPropagation();
    action();
  }

  return (
    <motion.div
      ref={cardRef}
      className="anime-card"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ scale: 1.02, rotate: 2 }}
    >
      <div className="anime-card-image">
        <img
          src={anime.image}
          alt={`Image de ${anime.title}`}
          draggable={false}
        />

        <AnimatePresence>
          {showHeartPop && (
            <motion.div
              className="heart-pop"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.35 }}
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>
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
          <button
            onClick={(event) => handleActionClick(event, onNotInterested)}
            className="action-btn reject"
          >
            ❌
          </button>

          <button
            onClick={(event) => handleActionClick(event, onSeen)}
            className="action-btn seen"
          >
            👁️
          </button>

          <button
            onClick={(event) => handleActionClick(event, onFavorite)}
            className="action-btn favorite"
          >
            {isFavorite ? "❤️" : "♡"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default AnimeCard;