import { createBrowserRouter } from "react-router";

import App from "../App";
import LandingPage from "../LandingPage";
import LoginPage from "../LoginPage";
import RequireAuth from "./RequireAuth";
import DashboardPage from "../DashboardPage";
import AccountPage from "../AccountPage";
import GiftPricingPage from "../GiftPricingPage";
import GiftCreationModePage from "../GiftCreationModePage";
import GiftCompositionPage from "../GiftCompositionPage";
import GiftMediaPage from "../GiftMediaPage";

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
          { path: "account", element: <AccountPage /> },
          {
            path: "gifts/:giftId/pricing",
            element: <GiftPricingPage />,
          },
          {
            path: "gifts/:giftId/creation-mode",
            element: <GiftCreationModePage />,
          },
          {
            path: "gifts/:giftId/composition",
            element: <GiftCompositionPage />,
          },
          {
            path: "gifts/:giftId/images",
            element: <GiftMediaPage />,
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
