const REDIS_ENV = process.env.REDIS_ENV ?? '127.0.0.1';

const config = {
    REDIS_ENV: REDIS_ENV
}

export default {
    REDIS_ENV
};