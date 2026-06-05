import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { AUTH_SESSION_EXPIRED_EVENT } from "./helpers/authSession";
import { useUserState } from "./store/useAppStore";

function App() {
  const clearAuthData = useUserState((state) => state.clearAuthData);
  const navigate = useNavigate();

  useEffect(() => {
    function handleAuthSessionExpired() {
      clearAuthData();
      navigate("/login", { replace: true });
    }

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleAuthSessionExpired,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleAuthSessionExpired,
      );
    };
  }, [clearAuthData, navigate]);

  return (
    <div className="app">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
