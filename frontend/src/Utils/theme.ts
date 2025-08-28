import { CSSVariablesResolver, MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  spacing: {
    xxs: "4px",
  },
  shadows: {
    around: "0 0 6px 2px rgba(0, 0, 0, 0.5)",
  },
  other: {
    color: {
      bg: "#FFFFFF",//"#1E1E1E",
      textColor: "white"//"#FFFFFF",
    },
  },
  colors: {
    deepRed: [
      "#ecf4ff",
      "#dce4f5",
      "#b9c7e2",
      "#94a8d0",
      "#748dc0",
      "#5f7cb7",
      "#5474b4",
      "#44639f",
      "#3a5890",
      "#2c4b80",
    ],
  },
  //primaryColor: "deepRed",
  //primaryShade: 5,
};

export const resolver: CSSVariablesResolver = (theme) => ({
  // variables: {
  //   "--mantine-color-bg": theme.other.color.bg,
  //   "--mantine-color-textColor": theme.other.color.textColor,
  // },
  // light: {
  //   "--mantine-color-bg": theme.other.color.bg,
  //   "--mantine-color-textColor": theme.other.color.textColor,
  // },
  // dark: {
  //   "--mantine-color-bg": theme.other.color.bg,
  //   "--mantine-color-textColor": theme.other.color.textColor,
  // },
});
