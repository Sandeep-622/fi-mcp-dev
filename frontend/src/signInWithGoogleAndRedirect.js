import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const signInWithGoogleAndRedirect = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Use 'temp1' as sessionId
    const sessionId = 'temp1';
    window.location.href = `http://localhost:8080/mockWebPage?sessionId=${sessionId}`;
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};
