import {
  ActionIcon,
  createTheme,
  Drawer,
  DrawerHeader,
  InputWrapper,
  LoadingOverlay,
  Modal,
  Paper,
  ScrollArea,
} from '@mantine/core';
import Colors from './colors';

const mantineTheme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#eff2ff',
      '#dfe2f2',
      '#bdc2de',
      '#99a0ca',
      '#7a84b9',
      '#6672af',
      '#5c69ac',
      '#4c5897',
      '#424e88',
      '#36437a',
    ],
  },
  headings: {
    sizes: {
      h1: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
      },
      h2: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
      },
      h3: {
        fontSize: '1rem',
        fontWeight: 'bold',
      },
    },
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
        overlayProps: { radius: 'sm', blur: 2 },
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        shadow: 'sm',
      },
    }),
    InputWrapper: InputWrapper.extend({
      defaultProps: {
        inputWrapperOrder: ['label', 'input', 'description', 'error'],
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: 'subtle',
      },
    }),
    ScrollArea: ScrollArea.extend({
      defaultProps: {
        scrollbarSize: 8,
      },
    }),
    Drawer: Drawer.extend({
      defaultProps: {
        position: 'right',
        size: 'lg',
      },
    }),
    Modal: Modal.extend({
      classNames: {
        title: 'font-bold',
      },
      defaultProps: {
        centered: true,
      },
    }),
  },
});

export default mantineTheme;
