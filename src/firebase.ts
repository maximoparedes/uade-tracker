import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCIZ2pmnqasBEl-FDdc8VoLASqJvmHkdb4',
  authDomain: 'uade-tracker.firebaseapp.com',
  projectId: 'uade-tracker',
  storageBucket: 'uade-tracker.firebasestorage.app',
  messagingSenderId: '547120529790',
  appId: '1:547120529790:web:9feda84f94eb05e19cf32f',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
