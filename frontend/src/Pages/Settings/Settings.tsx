import { Text } from "@mantine/core";
import { Switch } from "../../Components/Switch/Switch";
import { useCallback, useContext, useState } from "react";
import debounce from "lodash.debounce";
import { editMe } from "../../Api/users";
import { UserContext } from "../../Contexts/UserContext";

export const Settings = () => {
  const { user, setUser } = useContext(UserContext);

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

  return (
    <>
      <Text fw={600} size="lg" pb="sm">
        Settings
      </Text>
      <Switch
        label="Show mature content (I'm over 18)"
        checked={canSeeNSFW}
        onChange={handleChangeSwitch(setCanSeeNSFW)}
      />
    </>
  );
};
