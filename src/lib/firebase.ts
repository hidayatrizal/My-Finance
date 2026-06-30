import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0784773343",
  appId: "1:318062944792:web:8fc2bf66d79f63cf08596d",
  apiKey: "AIzaSyB5sqLFuavl6gA38GH5osykke7yCV1gt-U",
  authDomain: "gen-lang-client-0784773343.firebaseapp.com",
  storageBucket: "gen-lang-client-0784773343.firebasestorage.app",
  messagingSenderId: "318062944792",
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, "ai-studio-2039e464-9790-4258-b2c3-d3d1295593f4");
