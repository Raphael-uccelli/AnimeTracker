import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

function AnimeCard({
  anime,
  onSeen,
  onNotInterested,
  onFavorite,
  isFavorite,
  isFullscreen = false
}) {
  const cardRef = useRef(null);
  const lastTapRef = useRef(0);
  const zoomTimeoutRef = useRef(null);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!showHeartPop) return;
    const timeout = setTimeout(() => setShowHeartPop(false), 700);
    return () => clearTimeout(timeout);
  }, [showHeartPop]);

  // Annule un zoom en attente quand on change de carte ou qu'on quitte le composant
  useEffect(() => {
    return () => clearTimeout(zoomTimeoutRef.current);
  }, [anime.id]);

  function handleDragEnd(event, info) {
    clearTimeout(zoomTimeoutRef.current);

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

  function handleTap(event) {
    const target = event.target;
    const isElement = target instanceof Element;

    // Les boutons ont leur propre action
    if (isElement && target.closest(".action-btn, .zoom-btn")) {
      return;
    }

    const now = Date.now();

    // Double-tap : favori (et on annule le zoom qu'un premier tap avait programmé)
    if (now - lastTapRef.current < 300) {
      clearTimeout(zoomTimeoutRef.current);
      if (!isFavorite) setShowHeartPop(true);
      onFavorite();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;

    // Tap simple sur l'image : zoom, avec un court délai pour laisser
    // le temps à un éventuel double-tap. Désactivé en plein écran.
    const onImage = isElement && target.closest(".anime-card-image");

    if (onImage && !isFullscreen && anime.image) {
      zoomTimeoutRef.current = setTimeout(() => setIsZoomed(true), 300);
    }
  }

  function handleActionClick(event, action) {
    event.stopPropagation();
    action();
  }

  function handleZoomClick(event) {
    event.stopPropagation();
    setIsZoomed(true);
  }

  return (
    <>
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
          {anime.image ? (
            <img
              src={anime.image}
              alt={`Image de ${anime.title}`}
              draggable={false}
            />
          ) : (
            <div className="no-image">🎬</div>
          )}

          {anime.image && !isFullscreen && (
            <button
              className="zoom-btn"
              onClick={handleZoomClick}
              title="Voir l'image en entier"
            >
              ⤢
            </button>
          )}

          <AnimatePresence>
            {showHeartPop && (
              <motion.div
                className="heart-pop-wrap"
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

      {isZoomed &&
        createPortal(
          <div className="lightbox" onClick={() => setIsZoomed(false)}>
            <button className="lightbox-close" onClick={() => setIsZoomed(false)}>
              ✕
            </button>
            <img src={anime.image} alt={`Image de ${anime.title}`} />
          </div>,
          document.body
        )}
    </>
  );
}

export default AnimeCard;