> [Read in English](README.md)

# 🎬 MovieHouse

Веб-застосунок для пошуку та перегляду інформації про фільми, побудований на базі TMDB API.

Проєкт створений в рамках вивчення Full-Stack Web Development і демонструє роботу з REST API, серверним рендерингом, валідацією даних та сучасними підходами до розробки.

## 🔗 Live Demo

[moviehouse-mou1.onrender.com](https://moviehouse-mou1.onrender.com)

> Безкоштовний хостинг — перший запит може займати до 30 секунд через "засинання" сервера.

<img width="1902" height="864" alt="image" src="https://github.com/user-attachments/assets/0f65e044-c55d-4237-9ac5-dcd72d990d40" />

## Технології

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Styling:** Tailwind CSS v4 (CLI)
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit
- **Caching:** node-cache
- **Logging:** Morgan
- **Data:** TMDB API

## Функціонал

- Перегляд популярних фільмів та топ рейтингу у вигляді горизонтальних слайдерів
- Детальна сторінка фільму з постером, описом, жанрами, бюджетом та касовими зборами
- Пошук фільмів за назвою
- Розширена фільтрація за жанром, роком, рейтингом та сортуванням
- Посилання на стрімінгові сервіси (Rezka, Sweet.tv, КиївстарТВ, UAKino)
- Пагінація через кнопку "Завантажити ще" для слайдерів і результатів пошуку
- Кешування відповідей API (5 хвилин)
- Захист від надмірних запитів (rate limiting)
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
```bash
TMDB_READ_ACCESS_TOKEN=твій_токен
PORT=3000
NODE_ENV=development
```
Токен отримай на [themoviedb.org](https://www.themoviedb.org/settings/api) у розділі Settings → API.

### Запуск

```bash
npm run start
```
Для розробки з автоперезапуском:

```bash
npm run dev
```

Застосунок буде доступний на `http://localhost:3000`

## Структура проєкту
```bash
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
├── .env.example      # Шаблон змінних середовища
└── package.json
```
## Безпека

- `helmet` — HTTP security headers
- `express-rate-limit` — захист від DDoS та надмірних запитів
- Валідація вхідних даних через Zod
- Санітизація повідомлень про помилки на продакшені
- XSS захист при динамічному рендерингу DOM елементів

## Плани розвитку

- Серіали — окремі слайдери і сторінки
- Сторінки жанрів
- Авторизація і список обраного
- Розширена фільтрація в пошуку (комбінований текст + фільтри)

## Автор

[Юшко Назар](https://github.com/yushkonazar)
