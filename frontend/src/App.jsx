import Box from "@mui/material/Box";
import Board from "./components/Board";

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 6,
      }}
    >
      <Board />
    </Box>
  );
}
