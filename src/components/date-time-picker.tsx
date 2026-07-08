'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type {} from '@mui/x-date-pickers/AdapterDayjs';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

type DateTimePickerProps = {
  defaultValue: string;
  name: string;
};

const pickerTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          color: '#2b6873',
          fontWeight: 700,
          textTransform: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f3efe2',
          border: '1px solid rgb(43 104 115 / 0.15)',
          borderRadius: '2rem',
          color: '#1f1f1f',
        },
      },
    },
    MuiPickerDay: {
      styleOverrides: {
        root: {
          color: '#1f1f1f',
          fontWeight: 700,
          '&.Mui-selected': {
            backgroundColor: '#2b6873',
            color: '#f3efe2',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#2b6873',
          },
        },
        today: {
          borderColor: '#cdae82',
          color: '#5b3a28',
        },
      },
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          backgroundColor: '#f3efe2',
          color: '#1f1f1f',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'inherit',
        },
      },
    },
  },
  palette: {
    background: {
      paper: '#f3efe2',
    },
    primary: {
      main: '#2b6873',
    },
    text: {
      primary: '#1f1f1f',
      secondary: 'rgb(31 31 31 / 0.6)',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
  },
});

const textFieldSx = {
  '& .MuiInputBase-input': {
    color: '#1f1f1f',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '0.75rem 1rem',
  },
  '& .MuiInputBase-root': {
    backgroundColor: '#f3efe2',
    borderRadius: '1rem',
    minHeight: '3rem',
  },
  '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2b6873',
    borderWidth: '1px',
    boxShadow: '0 0 0 4px rgb(43 104 115 / 0.1)',
  },
  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgb(43 104 115 / 0.45)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgb(43 104 115 / 0.15)',
  },
  '& .MuiSvgIcon-root': {
    color: '#cdae82',
  },
};

/** Ready-made MUI X date/time picker themed to match the app palette. */
export function DateTimePicker({
  defaultValue,
  name,
}: DateTimePickerProps): React.JSX.Element {
  const [value, setValue] = useState<Dayjs | null>(() => dayjs(defaultValue));

  return (
    <ThemeProvider theme={pickerTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <input
          name={name}
          type="hidden"
          value={value?.isValid() ? value.format('YYYY-MM-DDTHH:mm') : ''}
        />
        <MuiDateTimePicker
          ampm
          desktopModeMediaQuery="@media (pointer: fine)"
          format="MMM D, YYYY h:mm A"
          onChange={setValue}
          slotProps={{
            actionBar: {
              actions: ['cancel', 'accept'],
            },
            desktopPaper: {
              sx: {
                backgroundColor: '#f3efe2',
                border: '1px solid rgb(43 104 115 / 0.15)',
                borderRadius: '2rem',
                boxShadow: '0 24px 60px rgb(43 104 115 / 0.16)',
                overflow: 'hidden',
              },
            },
            mobilePaper: {
              sx: {
                backgroundColor: '#f3efe2',
                borderRadius: '2rem 2rem 0 0',
              },
            },
            popper: {
              sx: {
                zIndex: 50,
              },
            },
            textField: {
              fullWidth: true,
              required: true,
              sx: textFieldSx,
            },
          }}
          value={value}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
