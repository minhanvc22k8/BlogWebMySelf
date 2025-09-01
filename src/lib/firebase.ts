import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Thêm dòng này
import { getAuth } from "firebase/auth";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmFO52bFhLjGsDaPbtRpQgGFcPZMInM_I",
  authDomain: "blogweb-47875.firebaseapp.com",
  projectId: "blogweb-47875",
  storageBucket: "blogweb-47875.firebasestorage.app",
  messagingSenderId: "494561293573",
  appId: "1:494561293573:web:f54c294c5b61e261d3f36c",
  measurementId: "G-LRH9H425VT"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
// Thêm dòng này để lấy công cụ Auth
const auth = getAuth(app);

// Thêm auth vào export
export { db, auth };