// Fix: Removed modular imports from 'firebase/firestore' to resolve circular dependency errors.
import { db } from './config';
import { SessionSummary } from '../types';

export const saveSessionSummary = async (userId: string, summary: SessionSummary): Promise<void> => {
  try {
    // Fix: Use v8 compat syntax for accessing collections and adding documents.
    const sessionsCollection = db.collection('users').doc(userId).collection('sessions');
    await sessionsCollection.add(summary);
  } catch (error) {
    console.error("Error saving session summary: ", error);
    throw error;
  }
};

export const getSessionHistory = async (userId: string): Promise<SessionSummary[]> => {
  try {
    // Fix: Use v8 compat syntax for querying the database.
    const sessionsCollection = db.collection('users').doc(userId).collection('sessions');
    const q = sessionsCollection.orderBy('date', 'desc');
    const querySnapshot = await q.get();
    
    const history: SessionSummary[] = [];
    querySnapshot.forEach((doc) => {
      history.push(doc.data() as SessionSummary);
    });
    return history;
  } catch (error) {
    console.error("Error fetching session history: ", error);
    throw error;
  }
};
