# 🎬 MovieHouse

Веб-застосунок для пошуку та перегляду інформації про фільми, побудований на базі TMDB API.

Проєкт створений в рамках вивчення Full-Stack Web Development і демонструє роботу з REST API, серверним рендерингом, валідацією даних та сучасними підходами до розробки.

## Технології

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Styling:** Tailwind CSS v4 (CLI)
- **Validation:** Zod
- **Logging:** Morgan
- **Data:** TMDB API

## Функціонал

- Перегляд популярних фільмів та топ рейтингу
- Детальна сторінка фільму з постером, описом, жанрами, бюджетом та касовими зборами
- Пошук фільмів за назвою
- Фільтрація за жанром, роком, рейтингом та сортуванням
- Посилання на стрімінгові сервіси (Rezka, Sweet.tv, КиївстарТВ, UAKino)
- Пагінація — кнопка "Завантажити ще" для слайдерів і результатів пошуку
- Сторінки помилок 404 і 500

## Запуск локально

### Вимоги
- Node.js 18+
- Акаунт на [TMDB](https://www.themoviedb.org) для отримання API токену

### Встановлення

```bash
git clone https://github.com/yushkonazar/moviehouse.git
cd moviehouse
npm install
```

### Налаштування змінних середовища

Створи файл `.env` в корені проєкту:
TMDB_READ_ACCESS_TOKEN=твій_токен
PORT=3000

Токен отримай на [themoviedb.org](https://www.themoviedb.org/settings/api) у розділі Settings → API.

### Запуск

```bash
npm run start
```

Застосунок буде доступний на `http://localhost:3000`

## Структура проєкту
moviehouse/
├── public/
│   ├── css/          # Tailwind output
│   └── images/       # Статичні зображення
├── src/
│   ├── schemas/      # Zod схеми валідації
│   └── services/     # Сервіси для роботи з TMDB API
├── views/
│   ├── partials/     # Header, Footer
│   └── *.ejs         # Сторінки
├── index.js          # Точка входу
└── package.json

## Плани розвитку

- Серіали — окремі слайдери і сторінки
- Сторінки жанрів
- Авторизація і список обраного
- Кешування запитів до API

## Автор

[Юшко Назар](https://github.com/yushkonazar)