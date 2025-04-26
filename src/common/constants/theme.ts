import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  createTheme,
  Drawer,
  HoverCard,
  InputWrapper,
  LoadingOverlay,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Tooltip,
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
    Button: Button.extend({
      defaultProps: {
        type: 'button',
      } as any,
    }),
    LoadingOverlay: LoadingOverlay.extend({
      defaultProps: {
        overlayProps: { radius: 'sm', blur: 2 },
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        shadow: 'xs',
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
      defaultProps: {
        centered: true,
        size: 'xl',
      },
    }),
    Checkbox: Checkbox.extend({
      defaultProps: {
        radius: 'sm',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        radius: 'sm',
        variant: 'filled',
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        color: 'white',
        c: 'black',
        multiline: true,
      },
    }),
    HoverCard: HoverCard.extend({
      defaultProps: {
        position: 'right',
      },
    }),
    Select: Select.extend({
      defaultProps: {
        searchable: true,
      },
    }),
  },
});

export default mantineTheme;
