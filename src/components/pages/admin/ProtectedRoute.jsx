import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../../firebase/firebase_config";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return user ? children : <Navigate to="/admin" replace />;
}
