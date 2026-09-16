import { createTheme } from "@mui/material/styles";

// Palette chaude et rassurante : terracotta / crème / ocre.
// Voir docs/prd-kanban-v1.md - section "Thème visuel".
const terracotta = "#C1573F";
const terracottaDark = "#9C4531";
const ochre = "#D9A441";
const cream = "#FBF3E7";
const paperCream = "#FFFBF5";
const columnHeaderCream = "#F3E3CC";
const overdueRed = "#B3453A";
const overdueBg = "#F6DCD4";
const ink = "#4A3B32";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: terracotta,
      dark: terracottaDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: ochre,
      contrastText: "#4A3B32",
    },
    background: {
      default: cream,
      paper: paperCream,
    },
    text: {
      primary: ink,
      secondary: "#7A6355",
    },
    error: {
      main: overdueRed,
    },
    divider: "#E5D3BC",
  },
  custom: {
    columnHeaderBg: columnHeaderCream,
    overdueBg,
    overdueBorder: overdueRed,
    ochre,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
