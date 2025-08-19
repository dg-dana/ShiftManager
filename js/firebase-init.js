import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCt2aZOWDLznozrVNTg4OIw7s5WBkx18Y",
  authDomain: "shift-calendar-18355.firebaseapp.com",
  projectId: "shift-calendar-18355",
  storageBucket: "shift-calendar-18355.firebasestorage.app",
  messagingSenderId: "29766311162",
  appId: "1:29766311162:web:11f376db291eae0550bd43",
  measurementId: "G-4PEYYWDTFD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
