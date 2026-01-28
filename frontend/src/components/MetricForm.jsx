import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'

const emptyMetric = {
  nome: '',
  valore: '',
  unita_misura: '',
  asse: 'y',
  categoria: '',
  data_registrazione: new Date().toISOString().slice(0, 16),
}

function MetricForm({ open, onClose, onSubmit, metric }) {
  const [formData, setFormData] = useState(emptyMetric)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (metric) {
      setFormData({
        ...emptyMetric,
        ...metric,
        valore: metric.valore?.toString() || '',
        data_registrazione: metric.data_registrazione?.slice(0, 16) || new Date().toISOString().slice(0, 16),
      })
    } else {
      setFormData({
        ...emptyMetric,
        data_registrazione: new Date().toISOString().slice(0, 16),
      })
    }
    setErrors({})
  }, [metric, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome obbligatorio'
    if (!formData.valore || isNaN(formData.valore)) newErrors.valore = 'Valore non valido'
    if (!formData.unita_misura.trim()) newErrors.unita_misura = 'Unità di misura obbligatoria'
    if (!formData.asse) newErrors.asse = 'Asse obbligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const data = {
      ...formData,
      valore: parseFloat(formData.valore),
      data_registrazione: formData.data_registrazione,
    }

    onSubmit(data)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{metric ? 'Modifica Metrica' : 'Nuova Metrica'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="nome"
              label="Nome metrica"
              value={formData.nome}
              onChange={handleChange}
              error={!!errors.nome}
              helperText={errors.nome}
              fullWidth
              required
              placeholder="es. Peso corporeo, VO2 max, 1RM Squat..."
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="valore"
              label="Valore"
              type="number"
              value={formData.valore}
              onChange={handleChange}
              error={!!errors.valore}
              helperText={errors.valore}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="unita_misura"
              label="Unità di misura"
              value={formData.unita_misura}
              onChange={handleChange}
              error={!!errors.unita_misura}
              helperText={errors.unita_misura}
              fullWidth
              required
              placeholder="es. kg, ml/kg/min, sec..."
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth required error={!!errors.asse}>
              <InputLabel>Asse</InputLabel>
              <Select
                name="asse"
                value={formData.asse}
                label="Asse"
                onChange={handleChange}
              >
                <MenuItem value="x">Ascisse (X)</MenuItem>
                <MenuItem value="y">Ordinate (Y)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="categoria"
              label="Categoria"
              value={formData.categoria}
              onChange={handleChange}
              fullWidth
              placeholder="es. Forza, Cardio, Flessibilità..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="data_registrazione"
              label="Data e ora registrazione"
              type="datetime-local"
              value={formData.data_registrazione}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSubmit} variant="contained">
          {metric ? 'Salva' : 'Aggiungi'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MetricForm
