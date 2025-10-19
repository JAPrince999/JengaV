// Fix: Import the firebase namespace to access types like UserCredential.
import firebase from 'firebase/compat/app';
import { auth } from './config';

// Fix: Removed modular imports from 'firebase/auth' that caused circular dependencies.
// All functions now use the v8 compat syntax (e.g., auth.createUserWithEmailAndPassword).

export const signUp = async (firstName: string, lastName: string, email: string, password: string): Promise<firebase.auth.UserCredential> => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  // Fix: Use user.updateProfile method from the v8 compat API.
  // Added non-null assertion as user is guaranteed to exist on successful creation.
  await userCredential.user!.updateProfile({
    displayName: `${firstName} ${lastName}`
  });
  return userCredential;
};

export const logIn = async (email: string, password: string): Promise<firebase.auth.UserCredential> => {
  // Fix: Use v8 compat syntax.
  return auth.signInWithEmailAndPassword(email, password);
};

export const logOut = async (): Promise<void> => {
  // Fix: Use v8 compat syntax.
  return auth.signOut();
};
