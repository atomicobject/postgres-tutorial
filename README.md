# Postgres Workshop

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Node.js 20+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)

## Install

```bash
cd frontend
npm install
```

## Run

Make sure Docker Desktop is running, then:

```bash
docker compose up --build
```

## Access

- **App**: http://localhost:3000
- **pgweb** (database UI): http://localhost:8081

## Workshop

You have been hired by a superhero organization to create reports on their team's performance. Their superheroes have all taken an assessment, and now we have a database with their results. Here are your objectives.

1. [Get Best and Worst Questions by Category](docs/best-worst-questions.md)
2. [Get the top weapons, vehicles and suits used](docs/top-tools-used.md)

![Hero Assessment Form](docs/hero-assessment-form.png)
