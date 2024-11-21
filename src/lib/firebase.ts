import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA6KrZ-_HBQx5hNp8tcC2lvKikohA5H590",
  authDomain: "room-status-662ee.firebaseapp.com",
  projectId: "room-status-662ee",
  storageBucket: "room-status-662ee.firebasestorage.app",
  messagingSenderId: "181739957588",
  appId: "1:181739957588:web:b021d6dcf2220199206cc1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);