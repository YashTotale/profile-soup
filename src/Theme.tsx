//React Imports
import React, { FC } from "react";

// Redux Imports

//Material UI Imports
import { createMuiTheme, ThemeProvider, CssBaseline } from "@material-ui/core";
import { amber, lightBlue } from "@material-ui/core/colors";

export const alternativeFont = "Arial, sans-serif";

const Theme: FC = ({ children }) => {
  const theme = createMuiTheme({
    overrides: {
      MuiTooltip: {
        arrow: {
          color: "rgb(0, 0, 0, 0.76)",
        },
        tooltip: {
          fontFamily: alternativeFont,
          fontWeight: 600,
          fontSize: "0.72rem",
          backgroundColor: "rgb(0, 0, 0, 0.76)",
        },
      },
      MuiButton: {
        label: {
          fontFamily: alternativeFont,
          fontWeight: 600,
        },
      },
      MuiMenuItem: {
        root: {
          fontFamily: alternativeFont,
          fontWeight: 600,
        },
      },
      MuiTablePagination: {
        spacer: {
          flexBasis: 25,
          flexGrow: 0,
        },
      },
    },
    typography: {
      fontFamily: "Palatino, Georgia, Serif",
      fontWeightBold: 600,
    },
    palette: {
      type: "light",
      primary: amber,
      secondary: lightBlue,
    },
    spacing: 8,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default Theme;
