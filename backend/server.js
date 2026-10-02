const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "AnimeTracker backend fonctionne !"
  });
});

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 heure
const SEARCH_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PAGES = 30; // garde-fou : 30 * 20 = 600 anime max par saison

const seasonCache = new Map();
const searchCache = new Map();

function mapKitsuAnime(item, categoryNameById) {
  const categoryRefs = item.relationships?.categories?.data || [];
  const genres = categoryRefs
    .map((ref) => categoryNameById[ref.id])
    .filter(Boolean);

  return {
    id: item.id,
    title:
      item.attributes.titles.en ||
      item.attributes.titles.en_jp ||
      item.attributes.titles.ja_jp,
    japaneseTitle: item.attributes.titles.ja_jp,
    description: item.attributes.synopsis,
    startDate: item.attributes.startDate,
    rating: item.attributes.averageRating
      ? Number(item.attributes.averageRating) / 10
      : null,
    type: item.attributes.subtype,
    episodes: item.attributes.episodeCount,
    status: item.attributes.status,
    image: item.attributes.posterImage?.large || null,
    genres
  };
}

function buildCategoryMap(included) {
  const categoryNameById = {};
  (included || []).forEach((item) => {
    if (item.type === "categories") {
      categoryNameById[item.id] = item.attributes.title;
    }
  });
  return categoryNameById;
}

async function fetchSeasonFromKitsu(year, season) {
  const results = [];
  let offset = 0;
  let pageCount = 0;

  while (pageCount < MAX_PAGES) {
    const response = await axios.get("https://kitsu.io/api/edge/anime", {
      params: {
        "filter[seasonYear]": year,
        "filter[season]": season,
        "page[limit]": 20,
        "page[offset]": offset,
        include: "categories"
      }
    });

    const page = response.data.data;
    if (page.length === 0) break;

    const categoryNameById = buildCategoryMap(response.data.included);

    for (const item of page) {
      const subtype = item.attributes.subtype;
      if (subtype !== "TV" && subtype !== "movie") continue;
      if (!item.attributes.startDate) continue;

      results.push(mapKitsuAnime(item, categoryNameById));
    }

    offset += 20;
    pageCount++;
  }

  results.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return results;
}

app.get("/api/anime/season", async (req, res) => {
  const { year, season } = req.query;

  if (!year || !season) {
    return res.status(400).json({
      message: "Les paramètres 'year' et 'season' sont requis."
    });
  }

  const cacheKey = `${year}_${season}`;
  const cached = seasonCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return res.json(cached.data);
  }

  try {
    const results = await fetchSeasonFromKitsu(year, season);

    seasonCache.set(cacheKey, { data: results, timestamp: now });

    res.json(results);
  } catch (error) {
    console.error("Erreur Kitsu :");
    console.error(error.response?.data || error.message);

    if (cached) {
      return res.json(cached.data);
    }

    res.status(500).json({
      message: "Erreur lors de la récupération des anime.",
      error: error.response?.data || error.message
    });
  }
});

app.get("/api/anime/search", async (req, res) => {
  const query = (req.query.q || "").trim();

  if (query.length < 2) {
    return res.json([]);
  }

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < SEARCH_CACHE_DURATION_MS) {
    return res.json(cached.data);
  }

  try {
    const response = await axios.get("https://kitsu.io/api/edge/anime", {
      params: {
        "filter[text]": query,
        "page[limit]": 20,
        include: "categories"
      }
    });

    const categoryNameById = buildCategoryMap(response.data.included);

    const results = response.data.data
      .filter(
        (item) =>
          (item.attributes.subtype === "TV" ||
            item.attributes.subtype === "movie") &&
          item.attributes.startDate
      )
      .map((item) => mapKitsuAnime(item, categoryNameById));

    searchCache.set(cacheKey, { data: results, timestamp: now });

    res.json(results);
  } catch (error) {
    console.error("Erreur Kitsu (recherche) :");
    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "Erreur lors de la recherche.",
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend lancé sur http://localhost:${PORT}`);
});