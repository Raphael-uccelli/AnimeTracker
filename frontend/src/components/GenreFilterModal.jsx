import { useState } from "react";

function GenreFilterModal({ allGenres, selectedGenres, onToggleGenre, onClose }) {
  const [query, setQuery] = useState("");

  const filteredGenres = allGenres.filter((genre) =>
    genre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Genres</h2>

        <input
          type="text"
          placeholder="Rechercher un genre..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="search-input"
          autoFocus
        />

        {filteredGenres.length === 0 && <p>Aucun genre trouvé.</p>}

        <div className="genre-grid">
          {filteredGenres.map((genre) => (
            <button
              key={genre}
              className={
                selectedGenres.includes(genre) ? "genre-pill active" : "genre-pill"
              }
              onClick={() => onToggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GenreFilterModal;