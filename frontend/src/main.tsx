import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Register } from "./Pages/Register/Register";
import { Login } from "./Pages/Login/Login";
import { Explore } from "./Pages/Explore/Explore";
import { Collection } from "./Pages/Collection/Collections";
import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { MainLayout } from "./Layouts/MainLayout/MainLayout";
import "./index.css";
import "@mantine/notifications/styles.css";
import { CreateCollection } from "./Pages/CreateCollection/CreateCollection";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

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
        path: "/collection/create",
        Component: CreateCollection,
      },
      {
        path: "/collection/:id",
        Component: Collection,
      },
    ],
  },
]);

const theme = createTheme({
  spacing: {
    xxs: "4px",
  },
  shadows: {
    around: "0 0 6px 2px rgba(0, 0, 0, 0.5)",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider>
        <RouterProvider router={router} />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
