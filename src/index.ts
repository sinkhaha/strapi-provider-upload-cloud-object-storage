import type { ReadStream } from 'node:fs';
import COS from 'cos-nodejs-sdk-v5';
import createDebug from 'debug';

const debug = createDebug('upload-tencent-cos:index');

interface File {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  stream?: ReadStream;
  buffer?: Buffer;
}

interface InitOptions {
  appId: string,
  region: string,
  bucket: string, 
  basePath: string, 
  secretId: string,
  secretKey: string,
}

function hasUrlProtocol(url: string) {
  return /^\w*:\/\//.test(url);
}

function getFileKey(file: File, basePath?: string) {
  const filePrefix = basePath ? `${basePath.replace(/\/+$/, '')}/` : '';
  const path = file.path ? `${file.path}/` : '';
  return `${filePrefix}${path}${file.hash}${file.ext}`;
}

export = {
  init(options: InitOptions) {
    const {
      appId,
      bucket,
      basePath,
      region,
      secretId,
      secretKey
    } = options;

    const cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
      Protocol: 'https:'
    });

    const Bucket = `${bucket}-${appId}`;
    debug('upload cos instance init success');

    return {
      /**
       * upload file
       */
      async upload (file: File) {
        if (!file.buffer) {
          throw new Error('Missing file buffer');
        }

        const fileKey = getFileKey(file, basePath);
        const putObjectResult: COS.PutObjectResult = await cos.putObject({ Bucket, Region: region, Key: fileKey, Body: file.buffer });
        
        debug('upload result', putObjectResult);

        const location = putObjectResult.Location;
        file.url = hasUrlProtocol(location)
          ? location
          : `https://${location}`;
        
        debug('url', file.url);
      },

      /**
       * delete file
       */
      async delete(file: File) {
        const fileKey = getFileKey(file, basePath);

        const rst: COS.DeleteObjectResult = await cos.deleteObject({
          Bucket,
          Region: region,
          Key: fileKey
        });

        debug('del result', rst);
      }
    };
  },
};
