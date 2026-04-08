import { createBrowserRouter } from "react-router";

import App from "../App";
import LandingPage from "../LandingPage";
import LoginPage from "../LoginPage";
import RequireAuth from "./RequireAuth";
import DashboardPage from "../DashboardPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <LoginPage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: "*",
        element: null,
      },
    ],
  },
]);
