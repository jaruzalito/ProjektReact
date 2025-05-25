🎯 Cel:
Stworzenie aplikacji webowej umożliwiającej ocenianie i komentowanie profili na Instagramie. Profile można wyszukiwać za pomocą API scrapera, bez potrzeby ręcznego ich dodawania.

⚙️ Technologie:
✅ Frontend (React):
React (z opcją rozszerzenia o TypeScript: .tsx)

REST API

Stylowanie responsywne (np. Tailwind, Bootstrap lub własny CSS)

Testy: React Testing Library + Jest

✅ Backend (Node.js + Express):
Express (z opcją migracji do TypeScript)

MongoDB jako baza danych

Integracja z zewnętrznym scraper API (np. z RapidAPI)

Testy: Jest / Mocha + Supertest

✅ DevOps / uruchamianie:
Docker + Docker Compose (oddzielne kontenery dla frontend, backend, mongo)

Gotowe Dockerfile + docker-compose.yml

Możliwość użycia .env do konfiguracji API tokenów i bazy

📦 Struktura bazy danych (MongoDB):
Users
_id, username, email, passwordHash

InstagramProfiles
_id, username, displayName, avatarUrl, followers, following, categoryId, createdAt, source (manual / scraper)

Categories
_id, name

Ratings
_id, userId, profileId, value, createdAt

Comments
_id, userId, profileId, text, createdAt

🔌 Scraper API:
Backend będzie pobierał dane o profilu po nazwie użytkownika z API (np. RapidAPI). Dane takie jak:

profile_pic_url

followers

following

full_name

...będą automatycznie zapisywane, gdy użytkownik wyszuka profil IG.
