function slide(id, direction) {
    const container = document.getElementById(id);
    container.scrollBy({ left: direction * 500, behavior: 'smooth' });
}

const pages = { trending: 1, toprated: 1 };

async function loadMore(type) {
    pages[type]++;
    const btn = document.getElementById(`load-more-${type}`);
    btn.textContent = 'Завантаження...';
    btn.disabled = true;

    try {
        const response = await fetch(`/api/${type}?page=${pages[type]}`);
        const movies = await response.json();
        const container = document.getElementById(type);

        movies.forEach(movie => {
            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '/images/no-poster.svg';
            const year = movie.release_date ? movie.release_date.split('-')[0] : '—';

            const card = document.createElement('a');
            card.href = `/movie/${movie.id}`;
            card.className = 'shrink-0 w-44 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 block';

            const img = document.createElement('img');
            img.src = poster;
            img.alt = movie.title;
            img.className = 'w-full h-64 object-cover';

            const info = document.createElement('div');
            info.className = 'p-3';

            const h3 = document.createElement('h3');
            h3.className = 'font-bold text-sm truncate';
            h3.textContent = movie.title;

            const meta = document.createElement('div');
            meta.className = 'flex justify-between items-center mt-1 text-xs text-gray-400';

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

            container.insertBefore(card, btn);
        });

        btn.innerHTML = '<span class="text-2xl">+</span> Завантажити ще';
        btn.disabled = false;
    } catch (error) {
        console.error('Error loading more movies:', error);
        btn.innerHTML = '<span>⚠</span> Помилка';
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Slide buttons
    const slideMap = {
        'btn-trending-prev':  ['trending',  -1],
        'btn-trending-next':  ['trending',   1],
        'btn-toprated-prev':  ['toprated',  -1],
        'btn-toprated-next':  ['toprated',   1],
    };
    Object.entries(slideMap).forEach(([id, [containerId, dir]]) => {
        document.getElementById(id)?.addEventListener('click', () => slide(containerId, dir));
    });

    // Load-more buttons
    ['trending', 'toprated'].forEach(type => {
        document.getElementById(`load-more-${type}`)?.addEventListener('click', () => loadMore(type));
    });

    // "Почати пошук" anchor
    document.getElementById('start-search')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => document.querySelector('input[name=q]')?.focus(), 400);
    });
});
