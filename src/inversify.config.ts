import { Container } from "inversify";
import "reflect-metadata";
import IORedis from "ioredis";
import Redis from 'ioredis';

import IFetchGithubFileStatsService from './interfaces/IFetchGithubFileStatsService'
import FetchGithubFileStatsService from "./services/FetchGithubFileStatsService";
import TYPES from "./types";
import config from './config/env'

const container = new Container();

// Redis Configuration
const redisClient = new Redis({ host: config.REDIS_ENV }) as IORedis.Redis;

redisClient.on('error', (err: any) => {
  console.log('Error occured while connecting or accessing redis server');
});

container.bind<IORedis.Redis>(TYPES.Redis).toConstantValue(redisClient);

// Services
container.bind<IFetchGithubFileStatsService>
    (TYPES.FetchGithubFileStatsService).to(FetchGithubFileStatsService);

export { container };