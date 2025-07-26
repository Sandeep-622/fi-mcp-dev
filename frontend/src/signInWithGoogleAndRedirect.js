import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const signInWithGoogleAndRedirect = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Use user.uid as sessionId
    const sessionId = user.uid;
    window.location.href = `http://localhost:8080/mockWebPage?sessionId=${sessionId}`;
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
};
