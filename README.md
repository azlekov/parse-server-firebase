# Parse Server Firebase

## Getting started

Install the module by npm

```
$ npm i -S parse-server-firebase
```

or using yarn

```
$ yarn add parse-server-firebase
```

## Firebase Storage Adapter
> Based on: https://github.com/parse-community/parse-server-gcs-adapter

```bash
FIREBASE_SERVICE_ACCOUNT="$(< firebaseAccountKey.json)"
FIREBASE_STORAGE_BUCKET="PROJECT_ID.appspot.com",
FIREBASE_STORAGE_CACHE_CONTROL="public, max-age=3600"
FIREBASE_STORAGE_DIRECT_ACCESS=false
```

`FIREBASE_SERVICE_ACCOUNT` can be specified as the string content of the credentials JSON file or can be specified as a path to the JSON file.

```bash
FIREBASE_SERVICE_ACCOUNT="/relative/to/project/firebaseAccountKey.json"
```

### Add adapter to your Parse Server

```ts
import { ParseServer } from 'parse-server'
import { FirebaseStorageAdapter } from 'parse-server-firebase'
...
const parserServer = new ParseServer({
  appId: "APP_ID",
  appName: "APP NAME",
  ...
  filesAdapter: new FirebaseStorageAdapter(),
})
```

## Fireabse Auth Adapter
> Based on: https://github.com/parse-server-modules/parse-server-firebase-auth-adapter

```bash
FIREBASE_SERVICE_ACCOUNT="$(< firebaseAccountKey.json)"
```

`FIREBASE_SERVICE_ACCOUNT` can be specified as the string content of the credentials JSON file or can be specified as a path to the JSON file by using:

```bash
FIREBASE_SERVICE_ACCOUNT="/relative/to/project/firebaseAccountKey.json"
```

### Add adapter to your Parse Server

```ts
import { ParseServer } from 'parse-server'
import { FirebaseAuthAdapter } from 'parse-server-firebase'
...
const parserServer = new ParseServer({
  appId: "APP_ID",
  appName: "APP NAME",
  ...
  auth: {
    firebase: new FirebaseAuthAdapter()
  }
})
```

### Authenticate

```bash
curl -X POST \
  {{host}}/parse/users \
  -H 'content-type: application/json' \
  -H 'x-parse-application-id: {{ParseAppId}}' \
  -d '{
    "authData": {
    	"firebase": {
    		"access_token": "{{firebase_access_token}}",
    		"id": "{{firebase_user_uid}}"
    	}
    }
}'
```

## Why so?

Based on previous adapters provided by the parse community this repository provides firebase adapters and extensions rewritten in TypesScript and newer features in JavaScript for Parse Server.

This package solves few issues. When setup firebase admin NodeJS SDK a credentials file is required. The previous adapters requires the credentials file to be specified by path. In some scenarios this is not aplicable because track the credentials file into the version control system is not good. This package will combine and contains everything needed for all of the service integration supported with Parse Server. In addition provided by this package storage adapter adds support for streaming of files.