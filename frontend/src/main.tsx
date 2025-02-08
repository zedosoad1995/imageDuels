import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./Pages/App";
import { Register } from "./Pages/Register/Register";
import { Login } from "./Pages/Login/Login";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
