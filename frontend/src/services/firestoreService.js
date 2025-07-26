// src/services/firestoreService.js
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";


export const saveUserData = async (userId, answers) => {
  await setDoc(doc(db, "users", userId), {
    ...answers,
    createdAt: new Date(),
  });
};

// Fetch data to display in dashboard
export const fetchUserData = async (userId) => {
  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// Update data when user makes progress
export const updateUserProgress = async (userId, newData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...newData,
    updatedAt: new Date(),
  });
};
