declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'production' | 'development';

    SERVER_PORT: number;

    API_SERVER_HOST: string;
    API_SERVER_PORT: number;
  }
}