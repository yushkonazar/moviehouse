import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { getMovieById, getPopularMovies, searchMovies } from "./src/services/tmdbService.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    try {
        const movies = await getPopularMovies();
        res.render("index", { movies, transparentHeader: false  })    
    } catch (error) {
        res.status(500).render("error", { message: error.message });
    }
});

app.get("/movie/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const movie = await getMovieById(id);
        res.render("movie", { movie, transparentHeader: true  });
    } catch (error) {
        res.status(500).render("error", { message: error.message });
    }
});

app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.render("search", { query: '', movies: [], transparentHeader: false })
        const movies = await searchMovies(query);
        res.render("search", { query, movies, transparentHeader: false });
    } catch (error) {
        res.status(500).render("error", { message: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});