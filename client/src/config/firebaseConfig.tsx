import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmhqdzmOdyMqtAs8UYVALshlSRvvNMQtQ",
  authDomain: "cho-healthcare-analytics-e9b41.firebaseapp.com",
  projectId: "cho-healthcare-analytics-e9b41",
  storageBucket: "cho-healthcare-analytics-e9b41.appspot.com",
  messagingSenderId: "858682343494",
  appId: "1:858682343494:web:3b667f99e72015bc894a47",
  measurementId: "G-48SZ7WSDW7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
// const analytics = getAnalytics(app);

auth.useDeviceLanguage();

export { auth };

export default app;