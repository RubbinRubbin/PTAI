import { Grid, Typography, Button, Box, Paper, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'

function AthleteHeader({ athlete, onBack, onExport }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mb: 2 }}
      >
        Torna alla lista
      </Button>

      <Paper sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight={700}>
              {athlete.nome} {athlete.cognome}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={athlete.sport} color="primary" sx={{ fontWeight: 600 }} />
              <Chip label={`${athlete.eta} anni`} variant="outlined" />
              {athlete.altezza && <Chip label={`${athlete.altezza} cm`} variant="outlined" />}
              {athlete.peso && <Chip label={`${athlete.peso} kg`} variant="outlined" />}
            </Box>
            {athlete.descrizione && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {athlete.descrizione}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onExport}
              color="success"
              sx={{ borderRadius: 2 }}
            >
              Esporta Backup
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default AthleteHeader
