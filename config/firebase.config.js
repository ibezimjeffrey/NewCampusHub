
import { initializeApp, getApp,getApps } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBOKtEdH5B7xnrxYLdRxj02pxrJNMiKHeo",
  authDomain: "campushub-3a5cb.firebaseapp.com",
  projectId: "campushub-3a5cb",
  storageBucket: "campushub-3a5cb.appspot.com",
  messagingSenderId: "388219904737",
  appId: "1:388219904737:web:3eb60c279d0f2d3f684da0"
};

const app = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig);

const firebaseAuth = getAuth(app);
const firestoreDB = getFirestore(app);
const firebaseStorage = getStorage(app);

export {app, firebaseAuth, firestoreDB, firebaseStorage};