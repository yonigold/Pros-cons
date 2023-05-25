import {db} from './firebase';

import { collection, getDocs, addDoc, doc, getDoc, setDoc } from "firebase/firestore";

export const addToWaitlist = async (email) => {
      const waitlistRef = doc(db, "waitlist", email);
    
      try {
        const docSnapshot = await getDoc(waitlistRef);
        if (docSnapshot.exists()) {
          // The email is already in the waitlist, check if it's been at least 5 minutes since the last submission
          const data = docSnapshot.data();
          const lastSubmitted = data.timestamp.toDate();
          const now = new Date();
          const timeDiff = Math.abs(now - lastSubmitted);
    
          // If it's been less than 5 minutes since the last submission, throw an error
          if (timeDiff < 1000 * 60 * 5) {
            throw new Error("You must wait at least 5 minutes between submissions.");
          } else {
            throw new Error("You're already on the waitlist.");
        }
        }
    
        // If the email isn't in the waitlist yet, or if it's been at least 5 minutes since the last submission, add/update the email in the waitlist
        await setDoc(waitlistRef, {
          email: email,
          timestamp: new Date()
        });
    
        console.log("Document written with ID: ", docSnapshot.id);
      } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
      }
    }