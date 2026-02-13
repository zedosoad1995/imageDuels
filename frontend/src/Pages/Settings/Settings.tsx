import { Button, Stack, Text, Title, Card } from "@mantine/core";
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
import classes from "./Settings.module.css";

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

      <Card className={classes.card}>
        <Stack gap="lg">
          <div className={classes.section}>
            <Switch
              label="Show mature content (I'm over 18)"
              checked={canSeeNSFW}
              onChange={handleChangeSwitch(setCanSeeNSFW)}
            />
          </div>

          <div className={classes.dangerSection}>
            <Text className={classes.dangerSectionTitle}>
              Danger Zone
            </Text>
            <Text className={classes.dangerSectionDescription}>
              Once you delete your account, there is no going back. Please be
              certain.
            </Text>
            <Button
              onClick={openDeleteModal}
              color="red"
              disabled={user?.role === "ADMIN"}
              variant="light"
            >
              Delete Account
            </Button>
            {user?.role === "ADMIN" && (
              <Text size="xs" c="dimmed" mt="xs">
                Account deletion is disabled for administrators.
              </Text>
            )}
          </div>
        </Stack>
      </Card>
    </>
  );
};
