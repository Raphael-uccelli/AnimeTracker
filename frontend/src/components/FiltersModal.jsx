import { useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récent" },
  { value: "rating", label: "Mieux notés" },
  { value: "oldest", label: "Plus ancien" }
];

function FiltersModal({
  allGenres,
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  sortOption,
  onChangeSort,
  onClose
}) {
  const [query, setQuery] = useState("");

  const filteredGenres = allGenres.filter((genre) =>
    genre.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Filtres</h2>

        <h3 className="section-title">Trier par</h3>
        <div className="sort-options">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={sortOption === option.value ? "genre-pill active" : "genre-pill"}
              onClick={() => onChangeSort(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <h3 className="section-title">
          Genres{selectedGenres.length > 0 ? ` (${selectedGenres.length})` : ""}
        </h3>

        <input
          type="text"
          placeholder="Rechercher un genre..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="search-input"
        />

        {filteredGenres.length === 0 && <p>Aucun genre trouvé.</p>}

        <div className="genre-grid">
          {filteredGenres.map((genre) => (
            <button
              key={genre}
              className={selectedGenres.includes(genre) ? "genre-pill active" : "genre-pill"}
              onClick={() => onToggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          {selectedGenres.length > 0 && (
            <button className="modal-btn reset" onClick={onClearGenres}>
              Effacer les genres
            </button>
          )}
          <button className="modal-btn season" onClick={onClose}>
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
}

export default FiltersModal;