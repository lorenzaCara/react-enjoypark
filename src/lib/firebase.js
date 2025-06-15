// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzNwq9C4TyuMZLxo4j8efcT1CQuKhwExc",
  authDomain: "heptapod-park.firebaseapp.com",
  projectId: "heptapod-park",
  storageBucket: "heptapod-park.firebasestorage.app",
  messagingSenderId: "632304257562",
  appId: "1:632304257562:web:c332268c63e16deda11fa3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };