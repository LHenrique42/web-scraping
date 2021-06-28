<h3 align="center">
  GitHub Web Scraping
</h3>

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/LHenrique42/web-scraping?color=%2304D361">

  <a href="https://github.com/LHenrique42">
    <img alt="Made by Henrique" src="https://img.shields.io/badge/made%20by-Henrique-%2304D361">
  </a>

  <img alt="License" src="https://img.shields.io/badge/license-MIT-%2304D361">
</p>

## About the project

Application to extract file stats from GitHub users repositories using NodeJS and Redis.

### Requirements

| Software                          | Version              |
| ----------------------------  | ------------------------ |
| Docker          | Docker version 19.03.12, build 48a66213fe |
| docker-compose | docker-compose version 1.25.0 |
| Node          | v14.16.1 |

### Execute and test

#### Execute (with docker-compose):

```
docker-compose up -f docker-compose.yml -d
```

#### Execute (without docker-compose):

```
docker build -f Dockerfile.Redis -t web-scraper-with-redis .
```

then:
```
docker run -p 3000:3000 web-scraper-with-redis
```

#### Execute (docker hub):
```
docker run -p 3000:3000 lhenrique42/web-scraper-with-redis
```

#### Test (make sure that you have a Redis container in execution):

Start Redis:

```
docker run -d -p 6379:6379 --name redis1 redis
```

```
REDIS='127.0.0.1' yarn test
```

### Routes

- **`GET /stats`**: The route receives this query params:

```
  username: <Github username>,
  repository: <Github repository>,
  branch: <repository branch name>
```

---

Make with 💜 by Henrique :wave: