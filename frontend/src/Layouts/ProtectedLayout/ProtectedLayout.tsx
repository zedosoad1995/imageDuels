import { Outlet, useNavigate } from "react-router";
import { useContext, useEffect } from "react";
import { UserContext } from "../../Contexts/UserContext";

export const ProtectedLayout = () => {
  const navigate = useNavigate();

  const { loggedIn, isFetchingLoggedUser, hasBeganLoggedUserFetch } =
    useContext(UserContext);

  useEffect(() => {
    if (isFetchingLoggedUser || !hasBeganLoggedUserFetch) return;

    if (!loggedIn) {
      // TODO: or show page not found or something like that
      navigate("/");
    }
  }, [isFetchingLoggedUser, loggedIn]);

  if (!loggedIn || isFetchingLoggedUser || !hasBeganLoggedUserFetch) {
    // TODO: show loading component
    return null;
  }

  return <Outlet />;
};
