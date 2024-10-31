declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT: string;
    KIMI_TOKEN: string;
  }
}

declare module 'eventsource-parser';
declare module 'form-data';
declare module 'stream';
declare module 'path';
declare module 'fs';
declare module 'mime';
declare module 'axios';
declare module 'lodash';
declare module 'cors';
declare module 'multer';