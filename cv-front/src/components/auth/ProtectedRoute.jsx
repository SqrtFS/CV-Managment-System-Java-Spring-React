import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "../../context/UserProfileContext";

// requiredRoles = ["RECRUITER", "ADMIN"]
const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { profile, loading } = useUserProfile();

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && (!profile || !requiredRoles.includes(profile.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;