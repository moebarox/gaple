import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyC4GHM4TMz8Bcg0BfbWpEOQyPF8JEgq3Z8',
    authDomain: 'gaple-a66b9.firebaseapp.com',
    projectId: 'gaple-a66b9',
    storageBucket: 'gaple-a66b9.appspot.com',
    messagingSenderId: '341027833404',
    appId: '1:341027833404:web:b1d2062967dfe876c66539',
    measurementId: 'G-TWVCYMGNQX',
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  return {
    provide: {
      db,
    },
  }
})
