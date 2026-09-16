import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import CardItem from "./CardItem";

export const COLUMN_DROPPABLE_PREFIX = "column:";

export function columnDroppableId(column) {
  return `${COLUMN_DROPPABLE_PREFIX}${column}`;
}

// Story 1 + 3 : en-tête de colonne avec nom + compteur de cartes.
export default function Column({
  column,
  cards,
  autoEditId,
  onInlineTitleSave,
  onOpenModal,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(column),
    data: { column },
  });
  const cardIds = cards.map((c) => c.id);

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        flex: "0 0 280px",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 190px)",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: (theme) => theme.custom.columnHeaderBg,
          borderBottom: "1px solid",
          borderColor: "divider",
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderTopRightRadius: (theme) => theme.shape.borderRadius,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            noWrap
            title={column}
          >
            {column}
          </Typography>
          <Chip label={cards.length} size="small" color="primary" />
        </Stack>
      </Box>
      <Box
        ref={setNodeRef}
        sx={{
          p: 1,
          flex: 1,
          overflowY: "auto",
          minHeight: 96,
          bgcolor: isOver ? "rgba(217, 164, 65, 0.15)" : "transparent",
          transition: "background-color 120ms ease",
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <Stack spacing={1}>
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                autoEdit={autoEditId === card.id}
                onInlineTitleSave={onInlineTitleSave}
                onOpenModal={onOpenModal}
              />
            ))}
          </Stack>
        </SortableContext>
      </Box>
    </Paper>
  );
}
