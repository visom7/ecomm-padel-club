# Ecomm Pädel Club

Web app for managing the Ecomm Pädel Club team — matchday calls, player availability, and match results.

## Tech Stack

- **Backend**: Java 25 + Spring Boot 3 + Spring Data MongoDB
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: MongoDB (native installation)
- **Deploy**: Docker Compose (backend + nginx)

## Features

- **Matchday management**: Create, edit, and close matchday calls with date, time, venue, and competition details.
- **Player availability**: Players can mark themselves as available or unavailable per matchday.
- **Quick response**: From the matchday list, players can tap ✅ Puedo / ❌ No puedo directly on the card without entering the detail view.
- **Match results**: Admins can register the final result including which players played, set scores per pair (up to 3 pairs, best of 3 sets), and the overall **match outcome** (Win / Loss / Draw).
- **Result history**: Played matches show the outcome badge (Victoria / Derrota / Empate) on both the list and detail views.
- **Admin PIN**: Protected actions (create, edit, delete, close, result) require an admin PIN via `X-Admin-Pin` header.

## Local Development

### Prerequisites
- Java 25 (via SDKMAN: `sdk use java 25-zulu`)
- Node.js 22+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
# Set JAVA_HOME to Java 25 if needed
export JAVA_HOME=$(sdk home java 25-zulu)
mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

## Deployment on Mini PC

### 1. Install MongoDB natively
Install MongoDB on the mini PC following the official docs. Ensure it listens on port 27017.

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set a strong ADMIN_PIN
```

### 3. Run with Docker Compose
```bash
docker compose up -d --build
```

The app will be available on port 80.

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/players | List all players | — |
| GET | /api/matchdays/active | Open & closed matchdays | — |
| GET | /api/matchdays/played | Played matches (history) | — |
| GET | /api/matchdays/{id} | Matchday detail | — |
| POST | /api/matchdays | Create matchday | Admin PIN |
| PUT | /api/matchdays/{id} | Edit matchday | Admin PIN |
| DELETE | /api/matchdays/{id} | Delete matchday | Admin PIN |
| POST | /api/matchdays/{id}/response | Submit availability | — |
| POST | /api/matchdays/{id}/result | Register match result + outcome | Admin PIN |
| POST | /api/matchdays/{id}/close | Close matchday | Admin PIN |

Admin actions require the `X-Admin-Pin` header.

### Result payload

```json
{
  "outcome": "WIN",
  "finalPlayers": ["Ernesto", "Jorge", "Alex", "Borja"],
  "pair1": { "sets": [{ "gamesHome": 6, "gamesAway": 3 }, { "gamesHome": 6, "gamesAway": 4 }] },
  "pair2": { "sets": [{ "gamesHome": 4, "gamesAway": 6 }, { "gamesHome": 6, "gamesAway": 4 }, { "gamesHome": 7, "gamesAway": 6 }] },
  "pair3": { "sets": [{ "gamesHome": 6, "gamesAway": 2 }, { "gamesHome": 6, "gamesAway": 3 }] }
}
```

`outcome` values: `WIN` | `LOSS` | `DRAW`

## Players

14 players pre-seeded on first boot:
- **Admins**: Jorge, Alfonso, Ernesto, Carmen
- **Players**: Alex B, Jose, Borja, Emilio, Rubén, Marco, Alex, Victor, Blas, Christian


## Push to docker:
cd /Users/ernesto/wed/data/ws/ecomm-padel-club/backend
docker buildx build --platform linux/amd64 -t visom77/padel-backend:latest --push .

cd ../frontend
docker buildx build --platform linux/amd64 -t visom77/padel-frontend:latest --push .


### Prerequisites
- Java 25 (via SDKMAN: `sdk use java 25-zulu`)
- Node.js 22+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
# Set JAVA_HOME to Java 25 if needed
export JAVA_HOME=$(sdk home java 25-zulu)
mvn spring-boot:run
# API available at http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

## Deployment on Mini PC

### 1. Install MongoDB natively
Install MongoDB on the mini PC following the official docs. Ensure it listens on port 27017.

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set a strong ADMIN_PIN
```

### 3. Run with Docker Compose
```bash
docker compose up -d --build
```

The app will be available on port 80.

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/players | List all players | — |
| GET | /api/matchdays/active | Open & closed matchdays | — |
| GET | /api/matchdays/played | Played matches (history) | — |
| GET | /api/matchdays/{id} | Matchday detail | — |
| POST | /api/matchdays | Create matchday | Admin PIN |
| PUT | /api/matchdays/{id} | Edit matchday | Admin PIN |
| DELETE | /api/matchdays/{id} | Delete matchday | Admin PIN |
| POST | /api/matchdays/{id}/response | Submit availability | — |
| POST | /api/matchdays/{id}/result | Register match result | Admin PIN |
| POST | /api/matchdays/{id}/close | Close matchday | Admin PIN |

Admin actions require the `X-Admin-Pin` header.

## Players

14 players pre-seeded on first boot:
- **Admins**: Jorge, Alfonso, Ernesto, Carmen
- **Players**: Alex B, Jose, Borja, Emilio, Rubén, Marco, Alex, Victor, Blas, Christian


## Push to docker:
cd /Users/ernesto/wed/data/ws/ecomm-padel-club/backend
docker buildx build --platform linux/amd64 -t visom77/padel-backend:latest --push .

cd ../frontend
docker buildx build --platform linux/amd64 -t visom77/padel-frontend:latest --push .
