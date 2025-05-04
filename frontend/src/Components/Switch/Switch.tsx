import { Switch as MantineSwitch } from "@mantine/core";
import classes from "./Switch.module.css";

interface Props {
  label: string;
  checked?: boolean | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
}

export const Switch = ({ label, checked, onChange }: Props) => {
  return (
    <MantineSwitch
      label={label}
      checked={checked}
      onChange={onChange}
      classNames={{ track: classes.switch }}
    />
  );
};
