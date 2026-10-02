import { useEffect, useMemo, useRef, useState } from "react";
import HomePage from "./components/HomePage";
import LibraryPage from "./components/LibraryPage";
import AnimeListPage from "./components/AnimeListPage";
import SearchPage from "./components/SearchPage";
import GenreFilterModal from "./components/GenreFilterModal";
import AnimeCard from "./components/AnimeCard";
import { fetchAnimesForSeason } from "./data/animes";

function loadSavedStatuses() {
  try {
    const saved = localStorage.getItem("animeTracker_statuses");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Erreur lors du chargement de la sauvegarde :", error);
    return [];
  }
}

function App() {
  const [animes, setAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [view, setView] = useState("home");

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const [animeStatuses, setAnimeStatuses] = useState(loadSavedStatuses);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [showGenreModal, setShowGenreModal] = useState(false);

  const [swipeHistory, setSwipeHistory] = useState([]);

  const handleBackRef = useRef(() => {});

  const favoriteAnimes = animeStatuses
    .filter((s) => s.favorite && s.anime)
    .map((s) => s.anime);

  const watchedAnimes = animeStatuses
    .filter((s) => s.status === "WATCHED" && s.anime)
    .map((s) => s.anime);

  const notInterestedAnimes = animeStatuses
    .filter((s) => s.status === "NOT_INTERESTED" && s.anime)
    .map((s) => s.anime);

  const pinnedIds = animeStatuses.filter((s) => s.pinned).map((s) => s.animeId);

  const allGenres = useMemo(() => {
    const genreSet = new Set();
    animes.forEach((anime) => {
      (anime.genres || []).forEach((genre) => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [animes]);

  const topGenres = useMemo(() => {
    const frequency = {};
    animes.forEach((anime) => {
      (anime.genres || []).forEach((genre) => {
        frequency[genre] = (frequency[genre] || 0) + 1;
      });
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  }, [animes]);

  const sortedFilteredAnimes = useMemo(() => {
    let list = [...animes];

    if (selectedGenres.length > 0) {
      list = list.filter((anime) =>
        (anime.genres || []).some((genre) => selectedGenres.includes(genre))
      );
    }

    if (sortOption === "newest") {
      list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (sortOption === "oldest") {
      list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sortOption === "rating") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  }, [animes, selectedGenres, sortOption]);

  const currentAnime = useMemo(() => {
    return sortedFilteredAnimes.find((anime) => {
      const status = animeStatuses.find((s) => s.animeId === anime.id);
      return !status || status.status === "UNSEEN";
    });
  }, [sortedFilteredAnimes, animeStatuses]);

  useEffect(() => {
    localStorage.setItem("animeTracker_statuses", JSON.stringify(animeStatuses));
  }, [animeStatuses]);

  useEffect(() => {
    if (!selectedYear || !selectedSeason) return;

    let isMounted = true;

    async function loadSeason() {
      setIsLoading(true);
      setErrorMessage("");
      setSwipeHistory([]);

      try {
        const seasonAnimes = await fetchAnimesForSeason(selectedYear, selectedSeason);

        if (!isMounted) return;

        setAnimes(seasonAnimes);
        setSelectedGenres([]);

        try {
          localStorage.setItem(
            `animeTracker_seasonSnapshot_${selectedYear}_${selectedSeason}`,
            JSON.stringify(seasonAnimes.map((a) => a.id))
          );
        } catch (storageError) {
          console.error("Impossible de sauvegarder l'instantané de saison :", storageError);
        }
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(
          "Impossible de charger cette saison. Verifie que le backend tourne sur le port 3000."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSeason();

    return () => {
      isMounted = false;
    };
  }, [selectedYear, selectedSeason]);

  function handleSelectSeason(year, season) {
    setSelectedYear(year);
    setSelectedSeason(season);
    setView("swipe");
  }

  function toggleGenre(genre) {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre]
    );
  }

  function handleBack() {
    setSwipeHistory((history) => {
      if (history.length === 0) return history;

      const lastId = history[history.length - 1];

      setAnimeStatuses((currentStatuses) =>
        currentStatuses.map((s) =>
          s.animeId === lastId ? { ...s, status: "UNSEEN" } : s
        )
      );

      return history.slice(0, -1);
    });
  }

  handleBackRef.current = handleBack;

  useEffect(() => {
    function onPopState() {
      handleBackRef.current();
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function pushHistoryEntry() {
    window.history.pushState({ animeTrackerSwipe: true }, "");
  }

  function upsertStatus(updater) {
    if (!currentAnime) return;

    setAnimeStatuses((currentStatuses) => {
      const existingStatus = currentStatuses.find(
        (s) => s.animeId === currentAnime.id
      );

      if (existingStatus) {
        return currentStatuses.map((s) =>
          s.animeId === currentAnime.id ? updater(s) : s
        );
      }

      return [
        ...currentStatuses,
        updater({
          animeId: currentAnime.id,
          status: "UNSEEN",
          favorite: false,
          pinned: false,
          anime: currentAnime
        })
      ];
    });
  }

  function handleSeen() {
    if (!currentAnime) return;
    upsertStatus((s) => ({ ...s, status: "WATCHED", anime: currentAnime }));
    setSwipeHistory((history) => [...history, currentAnime.id]);
    pushHistoryEntry();
  }

  function handleNotInterested() {
    if (!currentAnime) return;
    upsertStatus((s) => ({ ...s, status: "NOT_INTERESTED", anime: currentAnime }));
    setSwipeHistory((history) => [...history, currentAnime.id]);
    pushHistoryEntry();
  }

  function toggleFavoriteForAnime(anime) {
    if (!anime) return;

    setAnimeStatuses((currentStatuses) => {
      const existingStatus = currentStatuses.find((s) => s.animeId === anime.id);

      if (existingStatus) {
        return currentStatuses.map((s) =>
          s.animeId === anime.id ? { ...s, favorite: !s.favorite, anime } : s
        );
      }

      return [
        ...currentStatuses,
        { animeId: anime.id, status: "UNSEEN", favorite: true, pinned: false, anime }
      ];
    });
  }

  function handleFavorite() {
    toggleFavoriteForAnime(currentAnime);
  }

  function handleTogglePin(animeId) {
    setAnimeStatuses((current) =>
      current.map((s) =>
        s.animeId === animeId ? { ...s, pinned: !s.pinned } : s
      )
    );
  }

  function handleHardReset() {
    const confirmed = window.confirm(
      "Ça va effacer toute ta progression (vus, pas intéressés, favoris) et repartir du début. Continuer ?"
    );

    if (!confirmed) return;

    localStorage.removeItem("animeTracker_statuses");
    window.location.reload();
  }

  function goToLibrary() {
    setView("library");
  }

  function backFromList() {
    setView(selectedSeason ? "swipe" : "library");
  }

  const watchedCount = watchedAnimes.length;
  const notInterestedCount = notInterestedAnimes.length;
  const favoriteCount = favoriteAnimes.length;

  const currentAnimeStatus = animeStatuses.find(
    (s) => s.animeId === currentAnime?.id
  );

  return (
    <main>
      {view !== "home" && (
        <div className="top-bar">
          <h1>AnimeTracker</h1>
          <div className="top-bar-actions">
            <button onClick={goToLibrary} className="icon-button" title="Bibliothèque">
              📚
            </button>
            {view === "swipe" && (
              <button onClick={() => setView("search")} className="icon-button" title="Rechercher">
                🔍
              </button>
            )}
            <button onClick={handleHardReset} className="reset-button">
              🔄 Reset
            </button>
          </div>
        </div>
      )}

      {view === "home" && <HomePage onStart={() => setView("library")} />}

      {view === "library" && (
        <LibraryPage
          onSelectSeason={handleSelectSeason}
          animeStatuses={animeStatuses}
          onToggleFavorite={toggleFavoriteForAnime}
        />
      )}

      {view === "search" && (
        <SearchPage
          animes={animes}
          animeStatuses={animeStatuses}
          onBack={backFromList}
        />
      )}

      {view === "favorites" && (
        <AnimeListPage
          title="⭐ Mes favoris"
          animes={favoriteAnimes}
          emptyMessage="Aucun favori pour l'instant."
          onBack={backFromList}
          enablePin
          pinnedIds={pinnedIds}
          onTogglePin={handleTogglePin}
        />
      )}

      {view === "watched" && (
        <AnimeListPage
          title="👁️ Déjà vus"
          animes={watchedAnimes}
          emptyMessage="Tu n'as encore rien marqué comme vu."
          onBack={backFromList}
        />
      )}

      {view === "notInterested" && (
        <AnimeListPage
          title="❌ Pas intéressés"
          animes={notInterestedAnimes}
          emptyMessage="Aucun anime écarté pour l'instant."
          onBack={backFromList}
        />
      )}

      {view === "swipe" && (
        <>
          {isLoading && <p>Chargement de la saison...</p>}

          {!isLoading && errorMessage && <p>{errorMessage}</p>}

          {!isLoading && !errorMessage && (
            <>
              {topGenres.length > 0 && (
                <>
                  <h3 className="section-title">Genres</h3>
                  <div className="genre-filter-bar">
                    {topGenres.map((genre) => (
                      <button
                        key={genre}
                        className={
                          selectedGenres.includes(genre)
                            ? "genre-pill active"
                            : "genre-pill"
                        }
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </button>
                    ))}

                    <button
                      className="genre-pill more-button"
                      onClick={() => setShowGenreModal(true)}
                    >
                      + ...
                    </button>
                  </div>
                </>
              )}

              <select
                className="sort-select"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                <option value="newest">Plus récent → plus vieux</option>
                <option value="rating">Mieux notés</option>
                <option value="oldest">Plus vieux → plus récent</option>
              </select>

              {!currentAnime && (
                <>
                  <h2>🎉 Saison terminée !</h2>
                  <p>Tu as parcouru tous les anime de cette saison.</p>
                  <button onClick={goToLibrary} className="back-button">
                    📚 Choisir une autre saison
                  </button>
                </>
              )}

              {currentAnime && (
                <>
                  <button
                    onClick={handleBack}
                    disabled={swipeHistory.length === 0}
                    className="back-button"
                  >
                    ↩️ Revenir en arrière
                  </button>

                  <AnimeCard
                    anime={currentAnime}
                    onSeen={handleSeen}
                    onNotInterested={handleNotInterested}
                    onFavorite={handleFavorite}
                    isFavorite={currentAnimeStatus?.favorite ?? false}
                  />
                </>
              )}

                          </>
          )}
        </>
      )}

      {showGenreModal && (
        <GenreFilterModal
          allGenres={allGenres}
          selectedGenres={selectedGenres}
          onToggleGenre={toggleGenre}
          onClose={() => setShowGenreModal(false)}
        />
      )}

      {view !== "home" && (
        <nav className="bottom-nav">
          <button
            className={view === "notInterested" ? "active" : ""}
            onClick={() => setView("notInterested")}
          >
            ❌
            <span>{notInterestedCount}</span>
          </button>

          <button
            className={view === "favorites" ? "active" : ""}
            onClick={() => setView("favorites")}
          >
            ⭐
            <span>{favoriteCount}</span>
          </button>

          <button
            className={view === "watched" ? "active" : ""}
            onClick={() => setView("watched")}
          >
            👁️
            <span>{watchedCount}</span>
          </button>
        </nav>
      )}
    </main>
  );
}

export default App;