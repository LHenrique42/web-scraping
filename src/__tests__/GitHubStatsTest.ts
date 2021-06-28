import request from 'supertest';
import app from '../app';

describe('Stats', () => {
  it('should be able to get stats from a repository', async (done) => {
    const response = await request(app).get('/stats').query({
      repository: "gostack-fundamentos-node",
      username: "LHenrique42",
      branch: "master"
  }).send();

    expect(response.body).toMatchObject(
      [
        {
          lines: 9,
          bytes: 147,
          count: 1,
          extension: ".editorconfig"
        },
        {
          lines: 3,
          bytes: 26,
          count: 1,
          extension: ".eslintignore"
        },
        {
          lines: 158,
          bytes: 7808,
          count: 5,
          extension: ".json"
        },
        {
          lines: 1,
          bytes: 13,
          count: 1,
          extension: ".gitignore"
        },
        {
          lines: 109,
          bytes: 3260,
          count: 1,
          extension: ".md"
        },
        {
          lines: 190,
          bytes: 6211,
          count: 2,
          extension: ".js"
        },
        {
          lines: 1825,
          bytes: 79300,
          count: 1,
          extension: ".log"
        },
        {
          lines: 5236,
          bytes: 216000,
          count: 1,
          extension: ".lock"
        },
        {
          "lines": 244,
          bytes: 5736,
          count: 8,
          extension: ".ts"
        }
    ]);
    done();
  });
});
