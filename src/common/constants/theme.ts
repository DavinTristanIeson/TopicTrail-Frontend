import { createTheme, LoadingOverlay, Paper } from "@mantine/core";
import Colors from "./colors";

const mantineTheme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
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
  },
  components: {
    LoadingOverlay: LoadingOverlay.extend({
      defaultProps: {
        overlayProps: { radius: "sm", blur: 2 }
      }
    }),
    Paper: Paper.extend({
      defaultProps: {
        shadow: 'sm'
      }
    })
  }
});

export default mantineTheme;
