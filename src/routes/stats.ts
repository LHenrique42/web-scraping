import { Router } from 'express';
import GithubRepository from '../models/GithubRepository';
import Stats from '../models/Stats';
import Redis from 'ioredis';

import FetchFileStatsService from '../services/FetchFileStats';

const redisClient = new Redis({host: process.env.REDIS_ENV}) as any;

redisClient.on('error', (err: any) => {
  console.log('Error occured while connecting or accessing redis server');
});

const fetchFileStatsService = new FetchFileStatsService(redisClient);
const fetchFileStatsRouter = Router();

fetchFileStatsRouter.get('/', async (request, response) => {
  try {
    const { repository, username, branch } = request.body;
    
    const githubRepository: GithubRepository = { repository, username, branch };

    const repositoryStats: Stats[] = await fetchFileStatsService.execute({repository: githubRepository});

    return response.status(200).json(repositoryStats);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default fetchFileStatsRouter;
