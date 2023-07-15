import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASBdyrrSOuMk9A_UYo-FpKXIKHDp5Xb1w",
  authDomain: "house-marketplace-app-3d94c.firebaseapp.com",
  projectId: "house-marketplace-app-3d94c",
  storageBucket: "house-marketplace-app-3d94c.appspot.com",
  messagingSenderId: "243554942915",
  appId: "1:243554942915:web:ecbfe7d4740229e4380776"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()