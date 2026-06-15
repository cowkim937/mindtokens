// Firebase setup is isolated here so the app logic stays easy to maintain.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHtt8g7OeVKiQ5FHaInlTQfJGwSDXByUI",
  authDomain: "tripthe100.firebaseapp.com",
  projectId: "tripthe100",
  storageBucket: "tripthe100.firebasestorage.app",
  messagingSenderId: "751554033740",
  appId: "1:751554033740:web:4b5e70140695d1566d9ce9",
  measurementId: "G-ZNJJGW39DP"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);

export async function savePromptSession(session) {
  return addDoc(collection(db, "prompt_sessions"), {
    originalPrompt: session.originalPrompt,
    optimizedPrompt: session.optimizedPrompt,
    language: session.language,
    extractedKeywords: session.extractedKeywords,
    selectedKeywords: session.selectedKeywords,
    estimatedOriginalTokens: session.estimatedOriginalTokens,
    estimatedOptimizedTokens: session.estimatedOptimizedTokens,
    detailScore: session.detailScore,
    createdAt: serverTimestamp()
  });
}

export { analytics };
