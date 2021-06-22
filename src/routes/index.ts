import { Router } from 'express';
import fetchFileStatsRouter from './stats';

const routes = Router();

routes.use('/stats', fetchFileStatsRouter);

export default routes;
