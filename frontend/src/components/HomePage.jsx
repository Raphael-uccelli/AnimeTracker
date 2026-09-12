function HomePage({ onStart }) {
  return (
    <div className="home-page">
      <h1 className="home-title">🎬 AnimeTracker</h1>
      <p className="home-subtitle">
        Trie les animés sortis ces 5 dernières années, saison par saison.
      </p>

      <div className="tutorial-card">
        <h2>Comment ça marche ?</h2>
        <ul className="tutorial-list">
          <li>👉 Glisse à <strong>droite</strong> (ou 👁️) pour marquer un anime comme <strong>vu</strong></li>
          <li>👈 Glisse à <strong>gauche</strong> (ou ❌) si ça ne t'intéresse pas</li>
          <li>♡ Appuie sur le cœur pour l'ajouter à tes <strong>favoris</strong></li>
          <li>📚 Choisis une année et une saison dans la bibliothèque pour commencer</li>
        </ul>
      </div>

      <button className="start-button" onClick={onStart}>
        Commencer 🚀
      </button>
    </div>
  );
}

export default HomePage;