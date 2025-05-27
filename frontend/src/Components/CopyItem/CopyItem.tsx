import { CopyButton as MantineCopyButton, Menu } from "@mantine/core";
import CopyIcon from "../../assets/svgs/copy.svg?react";
import CheckIcon from "../../assets/svgs/check.svg?react";

export const CopyItem = () => {
  return (
    <MantineCopyButton value={window.location.href} timeout={2000}>
      {({ copied, copy }) => (
        <Menu.Item
          closeMenuOnClick={false}
          onClick={copy}
          color={copied ? "teal" : undefined}
          leftSection={
            copied ? <CheckIcon height={15} /> : <CopyIcon height={15} />
          }
        >
          {copied ? "Copied" : "Share"}
        </Menu.Item>
      )}
    </MantineCopyButton>
  );
};
