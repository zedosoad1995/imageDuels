import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./Pages/App";
import { Register } from "./Pages/Register/Register";
import { Login } from "./Pages/Login/Login";
import { Explore } from "./Pages/Explore/Explore";
import { Collection } from "./Pages/Collection/Collections";

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
  {
    path: "/explore",
    Component: Explore,
  },
  {
    path: "/collection/:id",
    Component: Collection,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
