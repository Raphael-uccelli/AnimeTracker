import { useEffect, useState } from "react";
import { SEASONS, getCurrentSeasonKey, getSeasonInfo } from "../utils/season";
import { fetchAnimesForSeason, fetchAnimeSearch } from "../data/animes";
import AnimeDetailsModal from "./AnimeDetailsModal";

function readSnapshot(year, season) {
  try {
    const raw = localStorage.getItem(`animeTracker_seasonSnapshot_${year}_${season}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LibraryPage({ onSelectSeason, animeStatuses }) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }

  const [expandedYear, setExpandedYear] = useState(null);
  const [currentSeasonHasNew, setCurrentSeasonHasNew] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSearchAnime, setSelectedSearchAnime] = useState(null);

  const current = getCurrentSeasonKey();

  useEffect(() => {
    let isMounted = true;

    async function checkCurrentSeason() {
      try {
        const freshAnimes = await fetchAnimesForSeason(current.year, current.season);
        if (!isMounted) return;

        const freshIds = freshAnimes.map((a) => a.id);
        const snapshot = readSnapshot(current.year, current.season);

        if (snapshot) {
          const hasNewIds = freshIds.some((id) => !snapshot.includes(id));
          setCurrentSeasonHasNew(hasNewIds);
        }
      } catch (error) {
        console.error("Impossible de vérifier les nouveautés de la saison en cours :", error);
      }
    }

    checkCurrentSeason();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recherche globale dans toute l'API, avec un petit délai pour ne pas
  // spammer le backend à chaque frappe
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await fetchAnimeSearch(trimmed);
        setSearchResults(results);
      } catch (error) {
        console.error("Erreur de recherche :", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function getBadge(year, seasonKey) {
    const snapshot = readSnapshot(year, seasonKey);
    if (!snapshot || snapshot.length === 0) return null;

    const allSorted = snapshot.every((id) => {
      const status = animeStatuses.find((s) => s.animeId === id);
      return status && (status.status === "WATCHED" || status.status === "NOT_INTERESTED");
    });

    if (allSorted) return "completed";

    if (year === current.year && seasonKey === current.season && currentSeasonHasNew) {
      return "new";
    }

    return null;
  }

  function handleGoToSeason(anime) {
    const info = getSeasonInfo(anime.startDate);
    const seasonKey = SEASONS[info.seasonIndex]?.key;

    if (!seasonKey) return;

    setSelectedSearchAnime(null);
    setSearchQuery("");
    onSelectSeason(info.year, seasonKey);
  }

  const showingSearch = searchQuery.trim().length >= 2;

  return (
    <div>
      <h2>📚 Bibliothèque</h2>

      <input
        type="text"
        placeholder="Rechercher un anime (toutes années confondues)..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="search-input"
      />

      {!showingSearch && (
        <>
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
                    {SEASONS.map((season) => {
                      const badge = getBadge(year, season.key);

                      return (
                        <button
                          key={season.key}
                          className="season-button"
                          onClick={() => onSelectSeason(year, season.key)}
                        >
                          {season.label}
                          {badge === "completed" && (
                            <span className="season-badge completed">✅</span>
                          )}
                          {badge === "new" && (
                            <span className="season-badge new">🆕</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showingSearch && (
        <div className="library-search-results">
          {isSearching && <p>Recherche en cours...</p>}

          {!isSearching && searchResults.length === 0 && (
            <p>Aucun résultat pour "{searchQuery}".</p>
          )}

          <ul className="favorites-list">
            {searchResults.map((anime) => (
              <li
                key={anime.id}
                className="favorite-item"
                onClick={() => setSelectedSearchAnime(anime)}
              >
                <img src={anime.image} alt={`Image de ${anime.title}`} />
                <div className="favorite-item-text">
                  <h3>{anime.title}</h3>
                  <p>{anime.releaseDate}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AnimeDetailsModal
        anime={selectedSearchAnime}
        onClose={() => setSelectedSearchAnime(null)}
        onGoToSeason={handleGoToSeason}
      />
    </div>
  );
}

export default LibraryPage;