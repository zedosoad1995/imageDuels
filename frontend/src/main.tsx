import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Register } from "./Pages/Register/Register";
import { Login } from "./Pages/Login/Login";
import { Collections } from "./Pages/Collections/Collections";
import { Collection } from "./Pages/Collection/Collection";
import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { MainLayout } from "./Layouts/MainLayout/MainLayout";
import "./index.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import { CreateCollection } from "./Pages/CreateCollection/CreateCollection";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { MyCollections } from "./Pages/MyCollections/MyCollections";
import { UserProvider } from "./Contexts/UserContext";
import { Settings } from "./Pages/Settings/Settings";
import { ProtectedLayout } from "./Layouts/ProtectedLayout/ProtectedLayout";
import { PageProvider } from "./Contexts/PageContext";
import { Feed } from "./Pages/Feed/Feed";
import { theme, resolver } from "./Utils/theme";

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
        Component: Collections,
      },
      {
        path: "/feed",
        Component: Feed,
      },
      {
        Component: ProtectedLayout,
        children: [
          {
            path: "/collections/me",
            Component: MyCollections,
          },
          {
            path: "/collections/create",
            Component: CreateCollection,
          },
          {
            path: "/settings",
            Component: Settings,
          },
        ],
      },
      {
        path: "/collections/:id",
        Component: Collection,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={createTheme(theme)} cssVariablesResolver={resolver}>
      <Notifications />
      <ModalsProvider>
        <PageProvider>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
        </PageProvider>
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
