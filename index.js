import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { discoverMovies, getGenres, getMovieById, getPopularMovies, getTopRatedMovies, searchMovies } from "./src/services/tmdbService.js";
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

// ── Rate limiters ─────────────────────────────────────────────────────────────

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Забагато запитів. Спробуйте пізніше.' },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { error: 'Забагато запитів до API. Спробуйте пізніше.' }
});

// ── Validation schemas ────────────────────────────────────────────────────────

const VALID_SORT = [
    'popularity.desc', 'popularity.asc',
    'vote_average.desc', 'vote_average.asc',
    'release_date.desc', 'release_date.asc',
];

// HTML forms always send "" for empty fields, never undefined.
// z.preprocess converts "" → undefined so .optional() works correctly.
const emptyStr = (schema) => z.preprocess((v) => (v === "" ? undefined : v), schema);

const SearchQuerySchema = z.object({
    q:                    emptyStr(z.string().trim().max(100).optional()),
    with_genres:          emptyStr(z.string().regex(/^\d+(,\d+)*$/).optional()),
    primary_release_year: emptyStr(z.coerce.number().int().min(1888).max(new Date().getFullYear() + 2).optional()),
    'vote_average.gte':   emptyStr(z.coerce.number().min(0).max(10).optional()),
    sort_by:              emptyStr(z.enum(VALID_SORT).default('popularity.desc')),
    page:                 emptyStr(z.coerce.number().int().min(1).max(500).default(1)),
});

const MovieIdSchema = z.coerce.number().int().positive().max(999_999_999);

const PageSchema = z.coerce.number().int().min(1).max(500).default(1);

// ── Search helpers ────────────────────────────────────────────────────────────

function buildFilters(data) {
    const filters = {};
    if (data.with_genres) filters.with_genres = data.with_genres;
    if (data.primary_release_year) filters.primary_release_year = data.primary_release_year;
    if (data['vote_average.gte']) filters['vote_average.gte'] = data['vote_average.gte'];
    filters.sort_by = data.sort_by;
    return filters;
}

// sort_by is always present.
// A non-default sort counts as a user filter — it must go through discoverMovies
// (the only TMDB endpoint that supports sort_by).
function hasUserFilters(filters) {
    const { sort_by, ...rest } = filters;
    return Object.keys(rest).length > 0 || sort_by !== 'popularity.desc';
}

async function fetchMovies(q, filters, page = 1) {
    const hasFilters = hasUserFilters(filters);
    if (q && hasFilters) {
        return discoverMovies({ ...filters, with_text_query: q }, page);
    } else if (q) {
        return searchMovies(q, page);
    } else if (hasFilters) {
        return discoverMovies(filters, page);
    }
    return [];
}

// ── Security middleware ───────────────────────────────────────────────────────

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:    ["'self'"],
            scriptSrc:     ["'self'"],
            scriptSrcAttr: ["'none'"],
            styleSrc:      ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            imgSrc:        ["'self'", "data:", "https://image.tmdb.org"],
            fontSrc:       ["'self'", "https://fonts.gstatic.com"],
            connectSrc:    ["'self'"],
        }
    }
}));

app.use(limiter);
app.use('/api', apiLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/", async (req, res) => {
    try {
        const [trending, popular] = await Promise.all([
            getCached('trending_1', () => getPopularMovies()),
            getCached('popular_1', () => getTopRatedMovies())
        ]);
        res.render("index", { trending, popular, heroHeader: false, heroFooter: false, showSearch: true });
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true, showSearch: true });
    }
});

app.get("/movie/:id", async (req, res) => {
    try {
        const parsed = MovieIdSchema.safeParse(req.params.id);
        if (!parsed.success) {
            return res.status(404).render("404", { heroHeader: false, heroFooter: true, showSearch: true });
        }
        const movie = await getMovieById(parsed.data);
        res.render("movie", { movie, heroHeader: true, heroFooter: false, showSearch: true });
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true, showSearch: true });
    }
});

app.get("/search", async (req, res) => {
    try {
        const parsed = SearchQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).render("error", {
                message: "Некоректні параметри пошуку",
                heroHeader: false, heroFooter: true, showSearch: true
            });
        }

        const { q, page } = parsed.data;
        const filters = buildFilters(parsed.data);
        const hasFilters = hasUserFilters(filters);
        const movies = await fetchMovies(q, filters, page);
        const genres = await getCached('genres', () => getGenres());

        res.render("search", {
            query: q || '',
            movies,
            genres: genres.genres,
            filters,
            hasFilters,
            heroHeader: false,
            heroFooter: false,
            showSearch: false
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("error", { message: getErrorMessage(error), heroHeader: false, heroFooter: true, showSearch: true });
    }
});

app.get("/api/search", async (req, res) => {
    try {
        const parsed = SearchQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({ error: "Некоректні параметри пошуку" });
        }

        const { q, page } = parsed.data;
        const filters = buildFilters(parsed.data);
        const movies = await fetchMovies(q, filters, page);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.get("/api/trending", async (req, res) => {
    try {
        const page = PageSchema.safeParse(req.query.page).data ?? 1;
        const movies = await getPopularMovies(page);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.get("/api/toprated", async (req, res) => {
    try {
        const page = PageSchema.safeParse(req.query.page).data ?? 1;
        const movies = await getTopRatedMovies(page);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: getErrorMessage(error) });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { heroHeader: false, heroFooter: true, showSearch: true });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
