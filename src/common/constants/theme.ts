import { createTheme } from "@mantine/core";
import Colors from "./colors";

const mantineTheme = createTheme({
  primaryColor: 'parallel',
  colors: {
    parallel: [
      "#fbf3f5",
      "#e7e7e7",
      "#cdcdcd",
      "#b2b2b2",
      "#9a9a9a",
      "#8b8b8b",
      "#848484",
      "#717171",
      "#656565",
      "#5c5557"
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
