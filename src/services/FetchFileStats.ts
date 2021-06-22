import axios from 'axios';
import JSDOM from 'jsdom';
import JSONCache from 'redis-json';
import { ISetOptions } from 'redis-json/types/src/lib/jsonCache.types';

import GithubRepository from '../models/GithubRepository';
import Stats from '../models/Stats';

interface Request {
  repository: GithubRepository;
}
class FetchFileStatsService {

  private _redisClient: any;
  
  constructor(redisClient: any) {
    this._redisClient = redisClient;
  }

  public async execute({ repository }: Request): Promise<Stats[]> {

    let stats: Stats[] = [];

    try {

      const uri = "https://github.com/" + repository.username + "/" + repository.repository + "/tree/" + repository.branch;
      
      const { data } = await axios.get(uri);

      const { document } = new JSDOM.JSDOM(data).window;

      const hrefLastCommit = document.getElementsByClassName('f6 Link--secondary text-mono ml-2 d-none d-lg-inline');

      const commitId = hrefLastCommit.item(0)?.textContent?.match(/[0-9a-z]+/)?.toString();

      const redisKey = repository.username + repository.repository + repository.branch + commitId;

      const jsonCache = new JSONCache<typeof stats>(this._redisClient, {prefix: 'cache:'});      

      let redisStats = await jsonCache.get(redisKey) as Stats[];

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

  private async GetFileStatsFromGithubRepository(repository: GithubRepository, subfolder: string = "", stats: Stats[]): Promise<Stats[]> {
    
    var subDirectories: string[] = [];

    try {

      const uri = "https://github.com/" + repository.username + "/" + repository.repository + "/tree/" + repository.branch + "/" + subfolder;
      
      const { data } = await axios.get(uri);

      const { document } = new JSDOM.JSDOM(data).window;

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
            var parsedSize = parseFloat(size[1].replace( /[^\d\.]*/g, ''));
            var bytes: number = 0;

            if(size.includes("Bytes")) {
              bytes = parsedSize;
            } else if(size.includes("KB")) {
              bytes = parsedSize * 1000;
            } else if(size.includes("MB")) {
              bytes = parsedSize * 1000 * 1000;
            }

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
}

export default FetchFileStatsService;
