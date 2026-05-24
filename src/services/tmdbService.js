import dotenv from "dotenv";
import { MovieDetailsSchema, TMDBResponseSchema } from "../schemas/movieSchema.js";
dotenv.config();

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

const getOptions = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOKEN}`
    }
};

export const getPopularMovies = async () => {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?language=uk-UA&page=1`, getOptions);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const json = await response.json();
        const result = TMDBResponseSchema.safeParse(json);
        if (!result.success) {
            console.error(`Error validating API data: ${result.error.format()}`);
            throw new Error('The data from the API does not match the expected format');
        }
        return result.data.results;
    } catch (error) {
        console.error(`Error querying TMDB: ${error.message}`);
        throw error;
    }
};

export const getMovieById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/${id}`, getOptions);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        const result = MovieDetailsSchema.safeParse(json);
        if (!result.success) {
            console.error(`Error validating API data: ${result.error.format()}`);
            throw new Error("The data from the API does not match the expected format");
        }
        return result.data;
    } catch (error) {
        console.error(`Error querying TMDB: ${error.message}`);
        throw error;
    }
};