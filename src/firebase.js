import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCHLRZHNW-C5Hbx4YMfDEt7ImB6wnd9OoU",
    authDomain: "hospital-dd40e.firebaseapp.com",
    projectId: "hospital-dd40e",
    storageBucket: "hospital-dd40e.appspot.com",
    messagingSenderId: "816030917287",
    appId: "1:816030917287:web:1aa13511db70926d0c7182"
  };
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };




