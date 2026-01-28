import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'

function AthleteCard({ athlete, onView, onEdit, onDelete }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h6" component="div">
              {athlete.nome} {athlete.cognome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {athlete.eta} anni
            </Typography>
          </Box>
        </Box>

        <Chip
          label={athlete.sport}
          color="primary"
          size="small"
          sx={{ mb: 2 }}
        />

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
    </Card>
  )
}

export default AthleteCard
