> [Читати українською](README.uk.md)

# 🎬 MovieHouse

A web application for searching and browsing movie information, built on top of the TMDB API.

The project was created as part of a Full-Stack Web Development learning path and demonstrates working with REST APIs, server-side rendering, data validation, and modern development practices.

## 🔗 Live Demo

[moviehouse-mou1.onrender.com](https://moviehouse-mou1.onrender.com)

> Free hosting — the first request may take up to 30 seconds due to server spin-up after inactivity.

<img width="1902" height="864" alt="image" src="https://github.com/user-attachments/assets/0f65e044-c55d-4237-9ac5-dcd72d990d40" />

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Styling:** Tailwind CSS v4 (CLI)
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit
- **Caching:** node-cache
- **Logging:** Morgan
- **Data:** TMDB API

## Features

- Browse popular and top-rated movies in horizontal carousel sliders
- Movie detail page with poster, description, genres, budget and box office revenue
- Search movies by title
- Advanced filtering by genre, release year, rating and sort order
- Links to streaming services (Rezka, Sweet.tv, KyivstarTV, UAKino)
- "Load more" pagination for sliders and search results
- API response caching (5-minute TTL)
- Rate limiting protection against excessive requests
- Custom 404 and 500 error pages

## Getting Started

### Requirements
- Node.js 18+
- A [TMDB](https://www.themoviedb.org) account to obtain an API token

### Installation

```bash
git clone https://github.com/yushkonazar/moviehouse.git
cd moviehouse
npm install
```

### Environment Variables

Create a `.env` file in the project root:
```bash
TMDB_READ_ACCESS_TOKEN=your_token_here
PORT=3000
NODE_ENV=development
```
Get your token at [themoviedb.org](https://www.themoviedb.org/settings/api) under Settings → API.

### Running

```bash
npm run start
```
For development with auto-restart:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
moviehouse/
├── public/
│   ├── css/          # Tailwind output
│   └── images/       # Static assets
├── src/
│   ├── schemas/      # Zod validation schemas
│   └── services/     # TMDB API service layer
├── views/
│   ├── partials/     # Header, Footer
│   └── *.ejs         # Page templates
├── index.js          # Entry point
├── .env.example      # Environment variable template
└── package.json
```

## Security

- `helmet` — HTTP security headers
- `express-rate-limit` — DDoS and excessive request protection
- Input validation via Zod
- Error message sanitization in production
- XSS protection for dynamic DOM rendering

## Roadmap

- TV Shows — dedicated sliders and detail pages
- Genre pages
- User authentication and watchlist
- Combined search with text + filters

## Author

[Nazar Yushko](https://github.com/yushkonazar)
