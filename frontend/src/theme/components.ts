import { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        height: '100%',
        width: '100%',
      },
      body: {
        height: '100%',
        width: '100%',
      },
      '#root': {
        height: '100%',
        width: '100%',
      },
      'input[type=number]': {
        MozAppearance: 'textfield',
        '&::-webkit-outer-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
        '&::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
      },
      img: {
        display: 'block',
        maxWidth: '100%',
      },
      a: {
        textDecoration: 'none',
        color: 'inherit',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
        padding: '10px 20px',
        '&:hover': {
          boxShadow: 'none',
        },
        '&:focus': {
          boxShadow: 'none',
        },
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '1rem',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.75rem',
      },
      containedPrimary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      }),
      containedSecondary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.secondary.dark,
        },
      }),
      outlinedPrimary: ({ theme }) => ({
        borderColor: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: 'rgba(45, 50, 119, 0.04)',
        },
      }),
      outlinedSecondary: ({ theme }) => ({
        borderColor: theme.palette.secondary.main,
        '&:hover': {
          backgroundColor: 'rgba(255, 230, 0, 0.04)',
        },
      }),
      textPrimary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: 'rgba(45, 50, 119, 0.04)',
        },
      }),
      textSecondary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: 'rgba(255, 230, 0, 0.04)',
        },
      }),
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '1px',
        },
      },
      notchedOutline: {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      input: {
        padding: '14px 16px',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '24px',
        '&:last-child': {
          paddingBottom: '24px',
        },
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        fontWeight: 500,
      },
      sizeSmall: {
        height: '24px',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        margin: '16px 0',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
      },
      elevation1: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation2: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      elevation3: {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
      },
      elevation4: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
      },
      elevation5: {
        boxShadow: '0px 10px 32px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
      head: {
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.87)',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '0.75rem',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
        margin: 8,
      },
      switchBase: {
        padding: 1,
        '&.Mui-checked': {
          transform: 'translateX(16px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            opacity: 1,
          },
        },
      },
      thumb: {
        width: 24,
        height: 24,
      },
      track: {
        borderRadius: 13,
        opacity: 1,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
    defaultProps: {
      color: 'default',
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: '#2D3277',
        color: '#FFFFFF',
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
        fontSize: '0.75rem',
        minWidth: '20px',
        height: '20px',
        padding: '0 6px',
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: '16px 0',
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        padding: '0 24px',
        minHeight: '64px',
        '&.Mui-expanded': {
          minHeight: '64px',
        },
      },
      content: {
        margin: '12px 0',
        '&.Mui-expanded': {
          margin: '12px 0',
        },
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: '0 24px 24px',
      },
    },
  },
  MuiRating: {
    styleOverrides: {
      root: {
        color: '#FFB400',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        height: '8px',
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      circle: {
        strokeLinecap: 'round',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        padding: '12px 16px',
      },
      standardSuccess: {
        backgroundColor: 'rgba(57, 181, 74, 0.1)',
        color: '#267D33',
      },
      standardError: {
        backgroundColor: 'rgba(229, 57, 53, 0.1)',
        color: '#AB000D',
      },
      standardWarning: {
        backgroundColor: 'rgba(255, 160, 0, 0.1)',
        color: '#C67100',
      },
      standardInfo: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        color: '#0B79D0',
      },
    },
  },
  MuiAlertTitle: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        marginBottom: '4px',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: '48px',
      },
      indicator: {
        height: '3px',
        borderTopLeftRadius: '3px',
        borderTopRightRadius: '3px',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        minHeight: '48px',
        padding: '12px 16px',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '12px',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '24px',
        fontSize: '1.25rem',
        fontWeight: 600,
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '0 24px 24px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        paddingTop: '12px',
        paddingBottom: '12px',
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '40px',
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        fontWeight: 500,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        padding: '12px 16px',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
      outlined: {
        transform: 'translate(16px, 14px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(16px, -6px) scale(0.75)',
        },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginLeft: '4px',
        marginRight: '4px',
      },
    },
  },
};