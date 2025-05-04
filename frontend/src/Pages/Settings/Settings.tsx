import { Button, Stack, Text } from "@mantine/core";
import { Switch } from "../../Components/Switch/Switch";
import { useCallback, useContext, useState } from "react";
import debounce from "lodash.debounce";
import { deleteMe, editMe } from "../../Api/users";
import { UserContext } from "../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { useNavigate } from "react-router";

export const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser, setLoggedIn } = useContext(UserContext);

  const [canSeeNSFW, setCanSeeNSFW] = useState(user?.canSeeNSFW as boolean);

  const debouncedUpdateUser = useCallback(
    debounce(
      async (checked: boolean) => {
        const updatedUser = await editMe({ canSeeNSFW: checked });
        setUser(updatedUser);
      },
      500,
      {
        leading: true,
        trailing: true,
      }
    ),
    []
  );

  const handleChangeSwitch =
    (setValue: React.Dispatch<React.SetStateAction<boolean>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.checked);
      debouncedUpdateUser(event.currentTarget.checked);
    };

  // TODO: when clicking NSFW on should a modal appear?

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: "Delete Account",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete your account? This action is
          irreversible.
        </Text>
      ),
      labels: { confirm: "Delete Account", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        await deleteMe();
        setUser(null);
        setLoggedIn(false);
        navigate("/");
        // TODO: when exception is thrown it should not close, and show a notification. Or not even close but show the notification
      },
    });

  return (
    <>
      <Text fw={600} size="lg" pb="sm">
        Settings
      </Text>
      <Stack>
        <Switch
          label="Show mature content (I'm over 18)"
          checked={canSeeNSFW}
          onChange={handleChangeSwitch(setCanSeeNSFW)}
        />
        <Button
          onClick={openDeleteModal}
          color="red"
          disabled={user?.role === "ADMIN"}
        >
          Delete Account
        </Button>
      </Stack>
    </>
  );
};
