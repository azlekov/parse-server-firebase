import { cert, getApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { credentials } from "./utils";

export default class FirebaseAuthAdapter {
  constructor() {
    initializeApp(
      {
        credential: cert(credentials()),
      },
      "auth"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateAuthData(
    authData: { access_token: string; id: string },
    options: unknown
  ): Promise<void> {
    try {
      const decodedToken = await getAuth(getApp("auth")).verifyIdToken(
        authData.access_token
      );
      if (decodedToken && decodedToken.uid === authData.id) {
        return;
      }
      throw new Parse.Error(
        Parse.Error.OBJECT_NOT_FOUND,
        "Firebase auth not found for this user."
      );
    } catch (error) {
      throw new Parse.Error(
        Parse.Error.OBJECT_NOT_FOUND,
        "Firebase auth is invalid for this user."
      );
    }
  }

  validateAppId(): Promise<void> {
    return Promise.resolve();
  }
}
