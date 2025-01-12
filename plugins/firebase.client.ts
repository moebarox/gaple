import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, logEvent } from 'firebase/analytics'

export default defineNuxtPlugin(() => {
  const { firebase } = useAppConfig()
  const firebaseConfig = {
    apiKey: firebase.apiKey,
    authDomain: firebase.authDomain,
    projectId: firebase.projectId,
    storageBucket: firebase.storageBucket,
    messagingSenderId: firebase.messagingSenderId,
    appId: firebase.appId,
    measurementId: firebase.measurementId,
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const analytics = getAnalytics(app)

  const track = (eventName: string, ...args) => logEvent(analytics, eventName, ...args)

  return {
    provide: {
      db,
      track,
    },
  }
})
