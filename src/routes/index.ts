import { Router } from 'express';
import fetchGithubFileStatsRouter from './githubStats';

const routes = Router();

routes.use('/stats', fetchGithubFileStatsRouter);

export default routes;
