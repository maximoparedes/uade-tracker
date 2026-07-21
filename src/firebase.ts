import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'

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
// persistentLocalCache writes to IndexedDB immediately — data survives page close
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
})
export const googleProvider = new GoogleAuthProvider()
