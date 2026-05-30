import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { discoverMovies, getGenres, getMovieById, getPopularMovies, getTopRatedMovies, searchMovies } from "./src/services/tmdbService.js"
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const requiredEnvVars = ['TMDB_READ_ACCESS_TOKEN', 'NODE_ENV'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

const getErrorMessage = (error) => 
    process.env.NODE_ENV === 'production' 
        ? 'Внутрішня помилка сервера. Спробуйте пізніше.' 
        : error.message;

const getCached = async (key, fetchFn) => {
    const cached = cache.get(key);
    if (cached) return cached;
    const data = await fetchFn();
    cache.set(key, data);
    return data;
};        
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100,                  // максимум 100 запитів з одного IP
    message: { error: 'Забагато запитів. Спробуйте пізніше.' },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 хвилина
    max: 30,                   // максимум 30 запитів до API
    message: { error: 'Забагато запитів до API. Спробуйте пізніше.' }
});


app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://image.tmdb.org"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(limiter);
app.use('/api', apiLimiter);
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    try {
        const [trending, popular] = await Promise.all([
            getCached('trending_1', () => getPopularMovies()),
            getCached('popular_1', () => getTopRatedMovies())
        ]);
        res.render("index", { trending, popular, heroHeader: false, heroFooter: false})    
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true });
    }
});

app.get("/movie/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(404).render("404", { heroHeader: false, heroFooter: true });
        }        
        const movie = await getMovieById(id);
        res.render("movie", { movie, heroHeader: true, heroFooter: false});
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true });
    }
});

app.get("/search", async (req, res) => {
    try {
        const {q, with_genres, primary_release_year, 'vote_average.gte': voteGte, sort_by} = req.query;

        const filters = {};
        if (with_genres) filters.with_genres = with_genres;
        if (primary_release_year) filters.primary_release_year = primary_release_year;
        if (voteGte) filters['vote_average.gte'] = voteGte;
        if (sort_by) filters.sort_by = sort_by;

        const hasFilters = Object.keys(filters).length > 0;

        let movies = [];

        if (q) {
            movies = await searchMovies(q);
        } else if (hasFilters) {
            movies = await discoverMovies(filters);
        }

        const genres = await getCached('genres', () => getGenres());
    
        res.render("search", { 
            query: q || '',
            movies,
            genres: genres.genres,
            filters,
            heroHeader: false,
            heroFooter: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true });
    }
});

app.get("/api/search", async (req, res) => {
    try {
        const { q, page = 1, with_genres, primary_release_year, 'vote_average.gte': voteGte, sort_by } = req.query;

        const filters = {};
        if (with_genres) filters.with_genres = with_genres;
        if (primary_release_year) filters.primary_release_year = primary_release_year;
        if (voteGte) filters['vote_average.gte'] = voteGte;
        if (sort_by) filters.sort_by = sort_by;

        let movies = [];
        if (q) {
            movies = await searchMovies(q, page);
        } else if (Object.keys(filters).length > 0) {
            movies = await discoverMovies(filters, page);
        }

        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.get("/api/trending", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const movies = await getPopularMovies(page);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.get("/api/toprated", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const movies = await getTopRatedMovies(page);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.use((req, res) => {
    res.status(404).render("404", {heroHeader: false, heroFooter: true});
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});