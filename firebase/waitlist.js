import {db} from './firebase';

import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";

export const addToWaitlist = async (email) => {
    try {
        const docRef = await addDoc(collection(db, "waitlist"), {
            email: email
        });
        console.log("Document written");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}