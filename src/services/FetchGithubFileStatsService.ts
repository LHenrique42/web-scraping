import axios from 'axios';
import { inject, injectable } from 'inversify';
import IORedis from 'ioredis';
import JSDOM from 'jsdom';
import JSONCache from 'redis-json';
import { ISetOptions } from 'redis-json/types/src/lib/jsonCache.types';

import IFetchGithubFileStatsService, { Request } from '../interfaces/IFetchGithubFileStatsService';
import GithubRepository from '../models/GithubRepository';
import Stats from '../models/Stats';
import TYPES from '../types';

@injectable()
class FetchGithubFileStatsService implements IFetchGithubFileStatsService {

  private _redisClient: IORedis.Redis;
  
  constructor(@inject(TYPES.Redis) redisClient: IORedis.Redis) {
    this._redisClient = redisClient;
  }

  public async Execute({ repository }: Request): Promise<Stats[]> {

    let stats: Stats[] = [];

    try {

      const uri = "https://github.com/" + repository.username + "/" + repository.repository + "/tree/" + repository.branch;
      
      const document: Document = await this.GetDocumentFromUri(uri);

      const hrefLastCommit = document.getElementsByClassName('f6 Link--secondary text-mono ml-2 d-none d-lg-inline');

      const commitId = hrefLastCommit.item(0)?.textContent?.match(/[0-9a-z]+/)?.toString();

      const redisKey = repository.username + repository.repository + repository.branch + commitId;

      const jsonCache = new JSONCache<typeof stats>(this._redisClient, {prefix: 'cache:'});      

      let redisStats = await jsonCache.get(redisKey) as Stats[];

      /* 
        Try Get from Redis. If fails -> Get from Github and save on redis with 3600 timeout
      */

      if(redisStats) {
        stats = redisStats;
      } else {
        stats = await this.GetFileStatsFromGithubRepository(repository, "", stats);
        const redisOptions: ISetOptions = { expire: 3600 }
        await jsonCache.set(redisKey, stats, redisOptions);
      }

    } catch (error) {
      throw error;
    }

    return stats;
  }

  private async GetFileStatsFromGithubRepository(
    repository: GithubRepository, subfolder: string = "", stats: Stats[]): Promise<Stats[]> {
    
    var subDirectories: string[] = [];

    try {

      const uri = "https://github.com/" + repository.username + "/" + repository.repository + "/tree/" + repository.branch + "/" + subfolder;

      const document: Document = await this.GetDocumentFromUri(uri);

      const rowHeaders = document.getElementsByClassName('js-navigation-open Link--primary');

      for(var i = 0; i < rowHeaders.length; ++i)
      {
        const file = rowHeaders.item(i)?.textContent;

        var extension = file?.match(/\.[0-9a-z]+$/i)?.toString();
        if(extension) {
          
          var newUrl = "https://github.com/" + repository.username + "/" + repository.repository + "/blob/" + repository.branch + "/" + subfolder + file;
          const { data } = await axios.get(newUrl);      
          
          const lineCount: string = data.match(/(?<line>([0-9])+\slines)/);
          const size: string = data.match(/(?<line>([0-9])+(.?)([0-9])+\s(Bytes|KB|MB))/);

          if(lineCount && size) {
            var parsedLines = parseInt(lineCount[1].replace( /[^\d\.]*/g, ''));
            var bytes: number = this.GetSizeInBytes(size);

            var stat = stats.find(x => x.extension === extension);
            if(stat) {
              var fileCount = stat?.count == null ? 1 : stat?.count + 1;
              var totalSize = stat?.bytes == null ? bytes : stat?.bytes + bytes;
              var totalLines = stat?.lines == null ? parsedLines : stat?.lines + parsedLines;
              const newStats: Stats = { lines : totalLines, bytes : totalSize, count : fileCount, extension : extension};
              var indexOf = stats.indexOf(stat);
              stats[indexOf] = newStats;
            } else {
              var fileCount = 1;
              const newStats: Stats = { lines : parsedLines, bytes : bytes, count : fileCount, extension : extension};
              
              stats.push(newStats);

            }
          } else {
            var newDirectory = rowHeaders.item(i)?.textContent;
            if(newDirectory) subDirectories.push(newDirectory);
          }
        } else {
          if(file) subDirectories.push(file);          
        }
      }
    } catch (error) {
      throw error;
    }

    for(const directory of subDirectories) {
      if(directory != ". .") {
        var newSubdirectory = subfolder.concat(directory + "/");
        await this.GetFileStatsFromGithubRepository(repository, newSubdirectory, stats);  
      }
    }
    return stats; 
  }

  private async GetDocumentFromUri(uri: string): Promise<Document> {
  
    const { data } = await axios.get(uri);

    const { document } = new JSDOM.JSDOM(data).window;

    return document;
  }

  private GetSizeInBytes(size: string): number {
    var bytes: number = 0
    var parsedSize = parseFloat(size[1].replace( /[^\d\.]*/g, ''));

    if(size.includes("Bytes")) {
      bytes = parsedSize;
    } else if(size.includes("KB")) {
      bytes = parsedSize * 1000;
    } else if(size.includes("MB")) {
      bytes = parsedSize * 1000 * 1000;
    }
    return bytes;
  }
}

export default FetchGithubFileStatsService;
