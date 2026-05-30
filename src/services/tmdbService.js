import dotenv from "dotenv";
import { GenresSchema, MovieDetailsSchema, TMDBResponseSchema } from "../schemas/movieSchema.js";
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

export const getPopularMovies = async (page = 1) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?language=uk-UA&page=${page}`, getOptions);

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

export const searchMovies = async (query, page = 1, filters = {}) => {
    try {
        const params = new URLSearchParams({
            query: encodeURIComponent(query),
            language: 'uk-UA',
            page,
            ...filters
        });

        const response = await fetch(`${BASE_URL}/search/movie?${params.toString()}`, getOptions);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        const result = TMDBResponseSchema.safeParse(json);
        if (!result.success) {
            console.error(`Error validating API data: ${result.error.format()}`);
            throw new Error("The data from the API does not match the expected format");
        }
        return result.data.results        
    } catch (error) {
        console.error(`Error querying TMDB: ${error.message}`);
        throw error;        
    }
};

export const getTopRatedMovies = async (page = 1) => {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?language=uk-UA&page=${page}`, getOptions);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        const result = TMDBResponseSchema.safeParse(json);
        if (!result.success) {
            console.error(`Error validating API data: ${result.error.format()}`);
            throw new Error('The data from the API does not match the expected format');
        }
        return result.data.results
    } catch (error) {
        console.error(`Error querying TMDB: ${error.message}`);
        throw error;        
    }
};

export const getGenres = async () => {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?language=uk-UA`, getOptions);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        const result = GenresSchema.safeParse(json);
        if (!result.success) {
            console.error(`Error validating API data: ${result.error.format()}`);
            throw new Error('The data from the API does not match the expected format');
        }
        return result.data        
    } catch (error) {
        console.error(`Error querying TMDB: ${error.message}`);
        throw error;          
    }
};

export const discoverMovies = async (filters = {}, page = 1) => {
    try {
        const params = new URLSearchParams({
            language: 'uk-UA',
            page,
            ...filters
        });

        const response = await fetch(`${BASE_URL}/discover/movie?${params}`, getOptions);
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