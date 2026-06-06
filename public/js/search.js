document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('search-results');
    const btn = document.getElementById('load-more-search');
    if (!btn || !container) return;

    // Data passed from server via data-attributes
    const searchQuery = decodeURIComponent(container.dataset.query || '');
    const searchFilters = JSON.parse(decodeURIComponent(container.dataset.filters || '{}'));

    let searchPage = 1;

    btn.addEventListener('click', async () => {
        searchPage++;
        btn.textContent = 'Завантаження...';
        btn.disabled = true;

        try {
            const params = new URLSearchParams({
                page: searchPage,
                q: searchQuery,
                ...searchFilters
            });

            const response = await fetch(`/api/search?${params.toString()}`);
            const movies = await response.json();

            if (!Array.isArray(movies) || movies.length === 0) {
                btn.textContent = 'Більше немає';
                return;
            }

            movies.forEach(movie => {
                const poster = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/images/no-poster.svg';
                const year = movie.release_date ? movie.release_date.split('-')[0] : '—';

                const card = document.createElement('a');
                card.href = `/movie/${movie.id}`;
                card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 block';

                const img = document.createElement('img');
                img.src = poster;
                img.alt = movie.title;
                img.className = 'w-full h-[450px] object-cover';

                const info = document.createElement('div');
                info.className = 'p-4';

                const h3 = document.createElement('h3');
                h3.className = 'font-bold text-lg truncate';
                h3.textContent = movie.title;

                const meta = document.createElement('div');
                meta.className = 'flex justify-between items-center mt-2 text-sm text-gray-400';

                const yearSpan = document.createElement('span');
                yearSpan.textContent = year;

                const ratingSpan = document.createElement('span');
                ratingSpan.className = 'text-yellow-500 font-semibold';
                ratingSpan.textContent = `⭐ ${movie.vote_average.toFixed(1)}`;

                meta.appendChild(yearSpan);
                meta.appendChild(ratingSpan);
                info.appendChild(h3);
                info.appendChild(meta);
                card.appendChild(img);
                card.appendChild(info);

                container.appendChild(card);
            });

            btn.textContent = 'Завантажити ще';
            btn.disabled = false;
        } catch (error) {
            console.error('Error:', error);
            btn.textContent = 'Помилка';
            setTimeout(() => { btn.textContent = 'Завантажити ще'; }, 1000);
            btn.disabled = false;
        }
    });
});
