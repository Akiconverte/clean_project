import React, { createContext, useState, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { createMuiTheme, ThemeProvider as MUIThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: darkMode ? "dark" : "light",
          primary: {
            main: darkMode ? "#3890FF" : "#0F2F6B", // Azul mais claro no Dark Mode para contraste
          },
          background: {
            default: darkMode ? "#202124" : "#ffffff",
            paper: darkMode ? "#2d2d2d" : "#ffffff",
          },
          text: {
            primary: darkMode ? "#ffffff" : "#202124",
            secondary: darkMode ? "#b0b0b0" : "#6B7280",
          }
        },
        shape: {
          borderRadius: 12,
        },
        overrides: {
          MuiPaper: {
            elevation1: {
              boxShadow: darkMode
                ? "0px 4px 20px rgba(0, 0, 0, 0.5)"
                : "0px 4px 20px rgba(0, 0, 0, 0.05)",
            }
          },
          MuiButton: {
            root: {
              textTransform: "none",
              fontWeight: "bold",
            }
          }
        }
      }),
    [darkMode]
  );

  const contextValue = useMemo(() => ({ darkMode, toggleTheme }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeContext = () => useContext(ThemeContext);
