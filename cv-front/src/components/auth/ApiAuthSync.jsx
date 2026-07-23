
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setupApiAuth } from "../../util/api";

const ApiAuthSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setupApiAuth(getToken);
  }, [getToken]);

  return null;
};

export default ApiAuthSync;