import * as path from 'path'
import * as admin from 'firebase-admin'
import { required } from './utils'

export default class FirebaseAuthAdapter {
    
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(this.credentials())
        }, "auth")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateAuthData(authData: { access_token: string; id: string }, options: unknown): Promise<void> {
        try {
            const decodedToken = await admin.app('auth').auth().verifyIdToken(authData.access_token)
            if (decodedToken && decodedToken.uid === authData.id) {
                return
            }
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Firebase auth not found for this user.')
        }
        catch (error) {
            throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, error)
        }
    }

    validateAppId(): Promise<void> {
        return Promise.resolve()
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