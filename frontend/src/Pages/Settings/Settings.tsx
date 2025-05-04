import { Text } from "@mantine/core";
import { Switch } from "../../Components/Switch/Switch";
import { useCallback, useState } from "react";
import debounce from "lodash.debounce";

export const Settings = () => {
  const [isNSFW, setIsNSFW] = useState(false);

  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const handleChangeSwitch =
    (setValue: React.Dispatch<React.SetStateAction<boolean>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.currentTarget.checked);
    };

  return (
    <>
      <Text fw={600} size="lg">
        Settings
      </Text>
      <Switch
        label="NSWF content (+18)"
        checked={isNSFW}
        onChange={handleChangeSwitch(setIsNSFW)}
      />
    </>
  );
};
