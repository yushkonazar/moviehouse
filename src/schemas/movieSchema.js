import { z } from "zod";

export const MovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    release_date: z.string(),
    vote_average: z.number()
});

export const MovieDetailsSchema = z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    release_date: z.string(),
    revenue: z.number(),
    runtime: z.number().nullable(),
    vote_average: z.number(),
    status: z.string(),
    budget: z.number(),
    genres: z.array(z.object({
        id: z.number(),
        name: z.string(),
    }))
});

export const GenresSchema = z.object({
    genres: z.array(z.object({
        id: z.number(),
        name: z.string()
    }))
});

export const TMDBResponseSchema = z.object({
    results: z.array(MovieSchema)
});