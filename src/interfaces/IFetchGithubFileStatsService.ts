import GithubRepository from "../models/GithubRepository";
import Stats from "../models/Stats";

export interface Request {
    repository: GithubRepository;
}

export default interface IFetchGithubFileStatsService {
    Execute({ repository }: Request): Promise<Stats[]>;
}