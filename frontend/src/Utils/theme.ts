import { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  spacing: {
    xxs: "4px",
  },
  shadows: {
    around: "0 0 6px 2px rgba(0, 0, 0, 0.5)",
    card: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    cardHover: "0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)",
    elevated:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    soft: "0 2px 15px rgba(0, 0, 0, 0.08)",
  },
  colors: {
    brand: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
  },
  colorScheme: "light",
  primaryColor: "brand",
  defaultRadius: "lg",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "1.2" },
      h2: { fontSize: "1.875rem", lineHeight: "1.3" },
      h3: { fontSize: "1.5rem", lineHeight: "1.4" },
      h4: { fontSize: "1.25rem", lineHeight: "1.4" },
      h5: { fontSize: "1.125rem", lineHeight: "1.5" },
      h6: { fontSize: "1rem", lineHeight: "1.5" },
    },
  },
  components: {
    Card: {
      defaultProps: {
        shadow: "card",
        radius: "xl",
        withBorder: false,
      },
      styles: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "#ffffff",
          color: "#111827",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          fontWeight: 500,
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        input: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "#ffffff",
          color: "#111827",
          borderColor: "rgba(0, 0, 0, 0.1)",
          "&::placeholder": {
            color: "#9ca3af",
          },
        },
      },
    },
    SegmentedControl: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "lg",
      },
    },
    Paper: {
      defaultProps: {
        radius: "xl",
        shadow: "card",
        withBorder: false,
      },
      styles: {
        root: {
          backgroundColor: "#ffffff",
          color: "#111827",
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: "#ffffff",
          color: "#111827",
        },
      },
    },
  },
  other: {
    glassBackground: "#ffffff",
    glassBorder: "rgba(0, 0, 0, 0.08)",
  },
};
