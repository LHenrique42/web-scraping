import { Router } from 'express';
import IFetchGithubFileStatsService from '../interfaces/IFetchGithubFileStatsService';
import { container } from '../inversify.config';
import GithubRepository from '../models/GithubRepository';
import Stats from '../models/Stats';
import TYPES from '../types';

const fetchFileStatsRouter = Router();

const fetchGithubFileStatsService: IFetchGithubFileStatsService =
  container.get<IFetchGithubFileStatsService>(TYPES.FetchGithubFileStatsService);

fetchFileStatsRouter.get('/', async (request, response) => {
  try {
    const repository = request.query['repository'];
    const username = request.query['username'];
    const branch = request.query['branch'];

    if (!(repository || username || branch)) {
      response.status(404).json({ error: 'There is an error on params' });
      return;
    }
    if (typeof repository !== "string" || typeof username !== "string" || 
      typeof branch !== "string") {
      response.status(404).json({ error: 'One or more params have invalid format' });
      return;
    }

    console.log(repository);
    
    const githubRepository: GithubRepository = { repository, username, branch };

    const repositoryStats: Stats[] = await fetchGithubFileStatsService.Execute({repository: githubRepository});

    return response.status(200).json(repositoryStats);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default fetchFileStatsRouter;
