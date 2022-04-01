# Parse Server Firebase

![npm](https://img.shields.io/npm/v/parse-server-firebase) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/parse-server-firebase) ![NPM](https://img.shields.io/npm/l/parse-server-firebase)

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

#### Extensions

**Generate thumbnails**

Ouf of the box you can generate thumbnails for images by specifying `FIREBASE_THUMBNAILS_SIZES` with an array of the desired target sizes. Each image will be generated, preserving the aspect ratio of the image and ensuring the image covers both provided dimensions by cropping/clipping to fit.

```bash
$ export FIREBASE_THUMBNAILS_SIZES="64x64,128x128,256x256"
```

If you want to resize to fit a specific width or height use the following syntax:

```bash
$ export FIREBASE_THUMBNAILS_SIZES="64,128x0,256x256"
```

The generated file names will have appended `_thumb_{size}` for example:

Original:

```
a217ca28b0bfac7db4e3f1272ebb8e12_test.jpg
```

and generated:

```
a217ca28b0bfac7db4e3f1272ebb8e12_test_thumb_0x512.jpg
a217ca28b0bfac7db4e3f1272ebb8e12_test_thumb_1280x720.jpg
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

Based on previous adapters provided by the parse community this repository provides Firebase adapters and extensions rewritten in TypesScript and newer features in JavaScript for Parse Server.

This package solves few issues. First, when setup firebase admin NodeJS SDK a credentials file is required. The previous adapters requires the credentials file to be specified by path. In some scenarios this is not aplicable because track the credentials file into the version control system is not good practice. This package will combine and contains everything needed for all of the service integration supported with Parse Server. In addition provided by this package storage adapter adds support for streaming of files.
