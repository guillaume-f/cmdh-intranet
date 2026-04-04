import { definePreset } from '@primeuix/themes';
import Nora from '@primeuix/themes/nora';

const CMDHPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50: '#fef8f0',
      100: '#fef0e0',
      200: '#fce4c1',
      300: '#fad9a3',
      400: '#f7c865',
      500: '#f4b726',
      600: '#e8a91a',
      700: '#d89d15',
      800: '#b37d11',
      900: '#8f610c',
      950: '#6b4808',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#ceaa18',
          inverseColor: '#ffffff',
          hoverColor: '#a88914',
          activeColor: '#8f610c',
          focusColor: 'rgba(206, 170, 24, 0.5)',
        },
        highlight: {
          background: '#fef8f0',
          focusBackground: '#fce4c1',
          color: '#ceaa18',
          focusColor: '#a88914',
        },
      },
      dark: {
        primary: {
          color: '#fad9a3',
          inverseColor: '#1f1f1f',
          hoverColor: '#fce4c1',
          activeColor: '#fef0e0',
          focusColor: 'rgba(250, 217, 163, 0.5)',
        },
        highlight: {
          background: 'rgba(206, 170, 24, 0.16)',
          focusBackground: 'rgba(206, 170, 24, 0.24)',
          color: '#fad9a3',
          focusColor: '#fce4c1',
        },
      },
    },
  },
});

export default CMDHPreset;
