<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kanatanime V3 - Neo Brutalism

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Docker Deployment

To run this application using Docker:

### Prerequisites
- Docker Engine
- Docker Compose (optional, for easier orchestration)

### Build and Run with Docker

```bash
# Build and run the container
docker build -t kanatanime-v3 .
docker run -p 80:80 kanatanime-v3
```

### Build and Run with Docker Compose

```bash
# Build and run using docker-compose
docker-compose up --build
```

The application will be accessible at `http://localhost`

## Features

- Neo-brutalist design aesthetic
- Responsive layout
- Developer tools detection
- Context menu navigation
