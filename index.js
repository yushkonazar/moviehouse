import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { getMovieById, getPopularMovies, getTopRatedMovies, searchMovies } from "./src/services/tmdbService.js"
import { fa } from "zod/v4/locales";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const requiredEnvVars = ['TMDB_READ_ACCESS_TOKEN'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    try {
        const [trending, popular] = await Promise.all([
            getPopularMovies(),
            getTopRatedMovies()
        ]);
        res.render("index", { trending, popular, heroHeader: false, heroFooter: false})    
    } catch (error) {
        res.status(500).render("error", { message: error.message, heroHeader: false, heroFooter: true });
    }
});

app.get("/movie/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const movie = await getMovieById(id);
        res.render("movie", { movie, heroHeader: true, heroFooter: false});
    } catch (error) {
        res.status(500).render("error", { message: error.message, heroHeader: false, heroFooter: true });
    }
});

app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.render("search", { query: '', movies: [], heroHeader: false, heroFooter: false})
        const movies = await searchMovies(query);
        res.render("search", { query, movies, heroHeader: false, heroFooter: false});
    } catch (error) {
        res.status(500).render("error", { message: error.message, heroHeader: false, heroFooter: true });
    }
});

app.get("/api/trending", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const movies = await getPopularMovies(page);
        res.json(movies);
    } catch (error) {
        res.status(500).render("error", { message: error.message, heroHeader: false, heroFooter: true });
    }
});

app.get("/api/toprated", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const movies = await getTopRatedMovies(page);
        res.json(movies);
    } catch (error) {
        res.status(500).render("error", { message: error.message, heroHeader: false, heroFooter: true });
    }
});

app.use((req, res) => {
    res.status(404).render("404", {heroHeader: false, heroFooter: true});
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});