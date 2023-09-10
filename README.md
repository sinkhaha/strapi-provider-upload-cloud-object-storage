> A provider for strapi server to upload file to Tencent COS.

# Installation

```
npm install strapi-provider-upload-cloud-object-storage --save
```

# Usage

strapi v4, See example below for `./config/plugins.js`
```ts
export default ({ env }) => ({
    upload: {
      config: {
        provider: 'strapi-provider-upload-cloud-object-storage', // the full name
        providerOptions: {
          appId: env('COS_APPID'),
          secretId: env('COS_SECRET_ID'), 
          secretKey: env('COS_SECRET_KEY'),
          region: env('COS_REGION'),
          bucket: env('COS_BUCKET'),
          basePath: env('COS_BASE_PATH'),
        },
      },
    }
});
```

# Provider Options

| Property       | Type   | Value                                    |
| -------------- | ------ | ---------------------------------------- |
| COS_APPID      | string | tencent appid                            |
| COS_SECRET_ID  | string | tencent secreted id                      |
| COS_SECRET_KEY | string | tencent secreted key                     |
| COS_REGION     | string | cosregion                                |
| COS_BUCKET     | string | bucket name                              |
| COS_BASE_PATH  | string | path to store the file, e.g. strapi-cms/ |

# Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
export default ({ env }) => { return [
  // ...
  { 
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            `${env('COS_BUCKET')}-${env('COS_APPID')}.cos.${env('COS_REGION')}.myqcloud.com` 
          ],
          "media-src": [
            "'self'", 
            "data:",
            "blob:", 
            `${env('COS_BUCKET')}-${env('COS_APPID')}.cos.${env('COS_REGION')}.myqcloud.com`
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
}


```


# Reference

* [tencent Node.js SDK docs](https://cloud.tencent.com/document/product/436/8629)
* [strapi providers docs](https://docs.strapi.io/dev-docs/providers)

