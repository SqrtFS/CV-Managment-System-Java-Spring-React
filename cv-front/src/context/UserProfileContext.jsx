import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../util/api";

const UserProfileContext = createContext(null);

export const UserProfileProvider = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }

    api.users
      .me()
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Failed to load current user profile", err);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [isSignedIn, isLoaded , reloadKey]);

  const isRecruiter = profile?.role === "RECRUITER";
  const isAdmin = profile?.role === "ADMIN";
  const isCandidate = profile?.role === "CANDIDATE";

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, isRecruiter, isAdmin, isCandidate, refetch: () => setReloadKey((k) => k + 1) }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);