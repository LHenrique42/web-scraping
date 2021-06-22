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

Application to extract stats informations from GitHub users repositories using NodeJS and Redis.

### Requirements

| Software                          | Version              |
| ----------------------------  | ------------------------ |
| Docker          | Docker version 19.03.12, build 48a66213fe |
| docker-compose | docker-compose version 1.25.0 |
| Node          | v14.16.1 |

### Execute and test

#### Execute:

```
docker-compose up -f docker-compose.yml -d
```

#### Test (make sure that you have a Redis container in execution - default port):

Start Redis:

```
docker run -d -p 6379:6379 --name redis1 redis
```

```
REDIS='127.0.0.1' yarn test
```

### Rotas da aplicação

- **`GET /stats`**: The route receives a json with this fields:

```json
{
    "username": <Github username>,
    "repository": <Github repository>,
    "branch": <repository branch name>
}
```

---

Feito com 💜 by Henrique :wave: