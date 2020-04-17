import * as path from 'path'
import { Request, Response } from 'express';
import { required, optional, persists, isImage, generateThumbnails } from './utils';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';

export interface File {
    filename: string;
    data: Buffer;
    contentType: string;
    options: {
        tags: unknown;
        metadata: unknown;
    };
}

export default class FirebaseStorageAdapter {

    private bucket: Bucket;
    private directAccess: boolean;

    constructor() {
        this.directAccess = optional('FIREBASE_STORAGE_DIRECT_ACCESS', false) as boolean

        this.bucket = admin.initializeApp({
            credential: admin.credential.cert(this.credentials()),
            storageBucket: required('FIREBASE_STORAGE_BUCKET'),
        }, "storage").storage().bucket();
    }

    async createFile(filename: string, data: Buffer, contentType: string, options: { tags: unknown; metadata: unknown }): Promise<void> {
        await this.uploadFile(this.bucket, { filename, data, contentType, options })

        if (persists('FIREBASE_THUMBNAILS_SIZES') && isImage(filename, contentType)) {
            generateThumbnails(this.bucket, { filename, data, contentType, options })
        }
    }

    async deleteFile(filename: string): Promise<unknown> {
        const file = this.bucket.file(filename);

        const exists = await file.exists()

        if (!exists[0]) {
            return Promise.reject(Parse.Error.OBJECT_NOT_FOUND)
        }

        return await file.delete()
    }

    async getFileData(filename: string): Promise<Buffer> {
        const file = this.bucket.file(filename);
        const exists = await file.exists()

        if (!exists[0]) {
            return Promise.reject(Parse.Error.OBJECT_NOT_FOUND)
        }

        const data = await file.download()
        return data[0]
    }

    getFileLocation(config: any, filename: string): string {
        if (this.directAccess) {
            return `https://storage.cloud.google.com/${this.bucket.name}/${filename}`
        } else {
            return `${config.mount}/files/${config.applicationId}/${encodeURIComponent(filename)}`
        }
    }

    async handleFileStream(filename: string, req: Request, res: Response): Promise<void> {
        const file = this.bucket.file(filename);

        const exists = await file.exists()

        if (!exists[0]) {
            return Promise.reject(Parse.Error.OBJECT_NOT_FOUND)
        }

        const metadata = await file.getMetadata()

        const parts = req.get('Range').replace(/bytes=/, '').split('-');

        const partialstart = parts[0];
        const partialend = parts[1];

        const start = parseInt(partialstart, 10);
        const end = partialend ? parseInt(partialend, 10) : metadata[0].size - 1;

        res.writeHead(206, {
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Range': 'bytes ' + start + '-' + end + '/' + metadata[0].size,
            'Content-Type': metadata[0].contentType,
        });

        return new Promise((resolve, reject) => {
            file.createReadStream({
                start: start,
                end: end
            }).on('data', (chunk) => {
                res.write(chunk);
            }).on('error', () => {
                res.sendStatus(404);
                reject(Parse.Error.OBJECT_NOT_FOUND)
            }).on('end', () => {
                res.end();
                resolve()
            })
        })
    }

    validateFilename(filename: string): Parse.Error | null {
        if (filename.length > 128) {
            return new Parse.Error(Parse.Error.INVALID_FILE_NAME, 'Filename too long.');
        }

        const regx = /^[_a-zA-Z0-9][a-zA-Z0-9@. ~_-]*$/;
        if (!filename.match(regx)) {
            return new Parse.Error(
                Parse.Error.INVALID_FILE_NAME,
                'Filename contains invalid characters.'
            );
        }
        return null;
    }

    private credentials(): admin.ServiceAccount {
        const data = required('FIREBASE_SERVICE_ACCOUNT')

        try {
            return JSON.parse(data);
        } catch (e) {
            return require(path.resolve('.', data))
        }
    }

    private async uploadFile(bucket: Bucket, file: File): Promise<void> {

        const cacheControl = optional('FIREBASE_STORAGE_CACHE_CONTROL', 'public, max-age=3600')

        const metadata = Object.assign({}, file.options.metadata, file.options.tags)
        Object.assign(metadata, metadata, {
            "cacheControl": cacheControl,
            "contentType": file.contentType || 'application/octet-stream',
        })

        const uploadStream = bucket.file(file.filename).createWriteStream({
            public: this.directAccess,
            metadata,
        })

        uploadStream.write(file.data)
        uploadStream.end()

        return new Promise((resolve, rejects) => {
            uploadStream.on('finish', resolve)
            uploadStream.on('error', rejects)
        })
    }
}