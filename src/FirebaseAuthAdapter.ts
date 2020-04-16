import * as path from 'path'
import * as admin from 'firebase-admin'
import { required } from './utils'

export default class FirebaseAuthAdapter {

    private firebase: admin.app.App

    constructor() {
        this.firebase = admin.initializeApp({
            credential: admin.credential.cert(this.credentials()),
            databaseURL: required('FIREBASE_DATABASE_URL')
        }, "auth")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateAuthData(authData: { access_token: string; id: string }, options: unknown): Promise<void> {
        try {
            const decodedToken = await this.verifyIdToken(authData.access_token)
            if (decodedToken && decodedToken.uid === authData.id) {
                return
            }
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Firebase auth not found for this user.')
        }
        catch (error) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Firebase auth is invalid for this user.')
        }
    }

    validateAppId(): Promise<void> {
        return Promise.resolve()
    }

    verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
        return this.firebase.auth().verifyIdToken(token)
    }

    private credentials(): admin.ServiceAccount {
        const data = required('FIREBASE_SERVICE_ACCOUNT')

        try {
            return JSON.parse(data);
        } catch (e) {
            return require(path.resolve('.', data))
        }
    }
}