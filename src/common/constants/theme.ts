import { createTheme } from "@mantine/core";
import Colors from "./colors";

const mantineTheme = createTheme({
  primaryColor: 'parallel',
  colors: {
    parallel: [
      "#eff2ff",
      "#dfe2f2",
      "#bdc2de",
      "#99a0ca",
      "#7a84b9",
      "#6672af",
      "#5c69ac",
      "#4c5897",
      "#424e88",
      "#36437a"
    ],
  },
  defaultRadius: 'md',
  defaultGradient: {
    from: Colors.backgroundPrimary,
    to: Colors.foregroundPrimary,
    deg: 45,
  }
});

export default mantineTheme;
