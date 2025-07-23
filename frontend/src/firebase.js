// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsIqU-qsveDuWJFivKqeLzbJrEkOC9EDc",
  authDomain: "fimoneyauth.firebaseapp.com",
  projectId: "fimoneyauth",
  storageBucket: "fimoneyauth.firebasestorage.app",
  messagingSenderId: "105802235095",
  appId: "1:105802235095:web:bfc7f0b85d1c44d4114492",
  measurementId: "G-W0DEEXKJW9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Initialize Analytics (optional)
export const analytics = getAnalytics(app)

export default app
