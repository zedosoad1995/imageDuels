import { Button, Stack, Text, Title } from "@mantine/core";
import { Switch } from "../../Components/Switch/Switch";
import { useCallback, useContext, useState } from "react";
import debounce from "lodash.debounce";
import { deleteMe, editMe } from "../../Api/users";
import { UserContext } from "../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { useNavigate } from "react-router";
import { usePage } from "../../Hooks/usePage";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";

export const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  usePage("settings");
  const isDesktop = useMediaQuery(MEDIA_QUERY_DESKTOP);

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
        navigate("/");
        // TODO: when exception is thrown it should not close, and show a notification. Or not even close but show the notification
      },
    });

  return (
    <>
      {isDesktop && (
        <Title order={2} pb="sm">
          Settings
        </Title>
      )}

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
