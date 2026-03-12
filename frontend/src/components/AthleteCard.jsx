import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Checkbox,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

function AthleteCard({ athlete, onView, onEdit, onDelete, selectionMode, isSelected, onToggleSelect }) {
  const borderColor = athlete.pagato ? '#4caf50' : '#f44336'

  const handleCardClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(athlete.id)
    }
  }

  return (
    <Card
      onClick={selectionMode ? handleCardClick : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `3px solid ${borderColor}`,
        borderRadius: 3,
        cursor: selectionMode ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(selectionMode && isSelected && {
          bgcolor: 'rgba(99, 102, 241, 0.05)',
          boxShadow: '0 0 0 2px #6366f1',
        }),
        '&:hover': {
          boxShadow: selectionMode
            ? '0 0 0 2px #6366f1'
            : `0 4px 20px ${athlete.pagato ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {selectionMode && (
          <Checkbox
            checked={isSelected}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              color: '#6366f1',
              '&.Mui-checked': { color: '#6366f1' },
            }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleSelect(athlete.id)}
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: borderColor, mr: 2 }} />
          <Box>
            <Typography variant="h6" component="div">
              {athlete.nome} {athlete.cognome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {athlete.eta} anni
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={athlete.sport}
            color="primary"
            size="small"
          />
          <Chip
            icon={athlete.pagato ? <CheckCircleIcon /> : <CancelIcon />}
            label={athlete.pagato ? 'Pagato' : 'Non pagato'}
            size="small"
            sx={{
              bgcolor: athlete.pagato ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: borderColor,
              fontWeight: 600,
              '& .MuiChip-icon': { color: borderColor },
            }}
          />
        </Box>

        {athlete.descrizione && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {athlete.descrizione.length > 100
              ? `${athlete.descrizione.substring(0, 100)}...`
              : athlete.descrizione}
          </Typography>
        )}

        {(athlete.altezza || athlete.peso) && (
          <Box sx={{ mt: 2 }}>
            {athlete.altezza && (
              <Typography variant="body2">
                Altezza: {athlete.altezza} cm
              </Typography>
            )}
            {athlete.peso && (
              <Typography variant="body2">
                Peso: {athlete.peso} kg
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      {!selectionMode && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button size="small" variant="contained" onClick={() => onView(athlete.id)}>
            Apri Sandbox
          </Button>
          <Box>
            <IconButton size="small" onClick={() => onEdit(athlete)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(athlete)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </CardActions>
      )}
    </Card>
  )
}

export default AthleteCard
