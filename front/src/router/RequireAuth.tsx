import { Navigate, Outlet } from "react-router";

import { useUserState } from "../store/useAppStore";

export default function RequireAuth() {
  const token = useUserState((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
