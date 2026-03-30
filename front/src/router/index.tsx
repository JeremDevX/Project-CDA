import { createBrowserRouter } from "react-router";

import App from "../App";
import LandingPage from "../LandingPage";

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
        path: "*",
        element: null,
      },
    ],
  },
]);
