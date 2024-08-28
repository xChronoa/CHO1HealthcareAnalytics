import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgRnC_qwW-covjgIqarCC_rnLNQY0lnKE",
  authDomain: "cho-healthcare-analytics.firebaseapp.com",
  projectId: "cho-healthcare-analytics",
  storageBucket: "cho-healthcare-analytics.appspot.com",
  messagingSenderId: "652642627834",
  appId: "1:652642627834:web:feb40a3391ca01084b9943",
  measurementId: "G-TDJ15V38EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export { auth };

export default app;