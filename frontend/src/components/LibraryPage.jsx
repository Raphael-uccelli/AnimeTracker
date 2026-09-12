import { useState } from "react";
import { SEASONS } from "../utils/season";

function LibraryPage({ onSelectSeason }) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }

  const [expandedYear, setExpandedYear] = useState(null);

  return (
    <div>
      <h2>📚 Bibliothèque</h2>
      <p className="library-intro">
        Choisis une année puis une saison pour commencer à trier.
      </p>

      <div className="year-list">
        {years.map((year) => (
          <div key={year} className="year-block">
            <button
              className={
                expandedYear === year ? "year-card active" : "year-card"
              }
              onClick={() =>
                setExpandedYear(expandedYear === year ? null : year)
              }
            >
              {year}
            </button>

            {expandedYear === year && (
              <div className="season-grid">
                {SEASONS.map((season) => (
                  <button
                    key={season.key}
                    className="season-button"
                    onClick={() => onSelectSeason(year, season.key)}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LibraryPage;