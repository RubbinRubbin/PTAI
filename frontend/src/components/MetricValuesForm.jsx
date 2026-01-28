import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  Paper,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

function MetricValuesForm({ open, onClose, onSubmit, definition }) {
  const [values, setValues] = useState([{ valore_x: '', valore_y: '' }])

  const handleChange = (index, field, value) => {
    const newValues = [...values]
    newValues[index][field] = value
    setValues(newValues)
  }

  const addRow = () => {
    setValues([...values, { valore_x: '', valore_y: '' }])
  }

  const removeRow = (index) => {
    if (values.length === 1) return
    const newValues = values.filter((_, i) => i !== index)
    setValues(newValues)
  }

  const handleSubmit = () => {
    // Valida che tutti i campi siano compilati
    const validValues = values.filter(
      (v) => v.valore_x !== '' && v.valore_y !== ''
    )

    if (validValues.length === 0) {
      alert('Inserisci almeno un valore')
      return
    }

    // Converte in numeri
    const data = validValues.map((v) => ({
      valore_x: parseFloat(v.valore_x),
      valore_y: parseFloat(v.valore_y),
    }))

    onSubmit(data)
    setValues([{ valore_x: '', valore_y: '' }])
  }

  const handleClose = () => {
    setValues([{ valore_x: '', valore_y: '' }])
    onClose()
  }

  if (!definition) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Aggiungi Valori - {definition.nome}
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="primary">
                Asse X: {definition.asse_x_nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({definition.asse_x_unita})
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="secondary">
                Asse Y: {definition.asse_y_nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({definition.asse_y_unita})
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {values.map((value, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid item xs={5}>
                <TextField
                  label={`${definition.asse_x_nome} (${definition.asse_x_unita})`}
                  type="number"
                  value={value.valore_x}
                  onChange={(e) => handleChange(index, 'valore_x', e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label={`${definition.asse_y_nome} (${definition.asse_y_unita})`}
                  type="number"
                  value={value.valore_y}
                  onChange={(e) => handleChange(index, 'valore_y', e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => removeRow(index)}
                  color="error"
                  disabled={values.length === 1}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={addRow}
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
        >
          Aggiungi Altro Valore
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annulla</Button>
        <Button onClick={handleSubmit} variant="contained">
          Salva Valori
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MetricValuesForm
