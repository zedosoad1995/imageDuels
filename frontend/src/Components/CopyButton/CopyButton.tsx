import {
  ActionIcon,
  ActionIconProps,
  CopyButton as MantineCopyButton,
  Tooltip,
} from "@mantine/core";
import CopyIcon from "../../assets/svgs/copy.svg?react";
import CheckIcon from "../../assets/svgs/check.svg?react";
import { useMemo } from "react";

interface Props {
  copyValue: string;
  size?: "xs" | "sm" | "md";
}

export const CopyButton = ({ copyValue, size }: Props) => {
  const iconHeight = useMemo(() => {
    if (!size || size === "md") return 20;
    if (size === "sm") return 15;
    return 12;
  }, [size]);

  return (
    <MantineCopyButton value={copyValue} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip
          label={copied ? "Link copied" : "Copy link"}
          events={{ hover: true, focus: true, touch: true }}
          withArrow
          position="right"
        >
          <ActionIcon
            color={copied ? "teal" : "gray"}
            variant="subtle"
            size={size}
            onClick={copy}
          >
            {copied ? (
              <CheckIcon height={iconHeight} />
            ) : (
              <CopyIcon height={iconHeight} />
            )}
          </ActionIcon>
        </Tooltip>
      )}
    </MantineCopyButton>
  );
};
