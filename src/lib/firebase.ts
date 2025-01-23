import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	GithubAuthProvider,
	TwitterAuthProvider,
	FacebookAuthProvider,
	sendPasswordResetEmail,
	confirmPasswordReset,
	sendEmailVerification,
	applyActionCode,
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.setCustomParameters({ prompt: "select_account" });
githubProvider.setCustomParameters({ prompt: "select_account" });

// Auth helper functions
export const resetPassword = async (email: string) => {
	await sendPasswordResetEmail(auth, email);
};

export const confirmPasswordResetCode = async (
	code: string,
	newPassword: string
) => {
	await confirmPasswordReset(auth, code, newPassword);
};

export const verifyEmail = async () => {
	if (auth.currentUser) {
		await sendEmailVerification(auth.currentUser);
	}
};

export const confirmEmailVerification = async (code: string) => {
	await applyActionCode(auth, code);
};

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
	if (err.code === "failed-precondition") {
		console.warn(
			"Multiple tabs open, persistence can only be enabled in one tab at a time."
		);
	} else if (err.code === "unimplemented") {
		console.warn("The current browser doesn't support persistence.");
	}
});
