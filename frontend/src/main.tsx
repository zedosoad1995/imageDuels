import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Register } from "./Pages/Register/Register";
import { Login } from "./Pages/Login/Login";
import { Explore } from "./Pages/Explore/Explore";
import { Collection } from "./Pages/Collection/Collections";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { MainLayout } from "./Layouts/MainLayout/MainLayout";
import "./index.css";

const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/register",
        Component: Register,
      },
      {
        path: "/",
        Component: Explore,
      },
      {
        path: "/collection/:id",
        Component: Collection,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>
);
