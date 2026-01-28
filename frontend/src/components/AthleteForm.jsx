import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material'

const emptyAthlete = {
  nome: '',
  cognome: '',
  eta: '',
  sport: '',
  descrizione: '',
  altezza: '',
  peso: '',
  data_nascita: '',
  note: '',
}

function AthleteForm({ open, onClose, onSubmit, athlete }) {
  const [formData, setFormData] = useState(emptyAthlete)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (athlete) {
      setFormData({
        ...emptyAthlete,
        ...athlete,
        eta: athlete.eta?.toString() || '',
        altezza: athlete.altezza?.toString() || '',
        peso: athlete.peso?.toString() || '',
        data_nascita: athlete.data_nascita || '',
      })
    } else {
      setFormData(emptyAthlete)
    }
    setErrors({})
  }, [athlete, open])

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
    if (!formData.cognome.trim()) newErrors.cognome = 'Cognome obbligatorio'
    if (!formData.eta || isNaN(formData.eta) || formData.eta < 1) {
      newErrors.eta = 'Età non valida'
    }
    if (!formData.sport.trim()) newErrors.sport = 'Sport obbligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const data = {
      ...formData,
      eta: parseInt(formData.eta),
      altezza: formData.altezza ? parseFloat(formData.altezza) : null,
      peso: formData.peso ? parseFloat(formData.peso) : null,
      data_nascita: formData.data_nascita || null,
    }

    onSubmit(data)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {athlete ? 'Modifica Atleta' : 'Nuovo Atleta'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              name="nome"
              label="Nome"
              value={formData.nome}
              onChange={handleChange}
              error={!!errors.nome}
              helperText={errors.nome}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="cognome"
              label="Cognome"
              value={formData.cognome}
              onChange={handleChange}
              error={!!errors.cognome}
              helperText={errors.cognome}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="eta"
              label="Età"
              type="number"
              value={formData.eta}
              onChange={handleChange}
              error={!!errors.eta}
              helperText={errors.eta}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="sport"
              label="Sport"
              value={formData.sport}
              onChange={handleChange}
              error={!!errors.sport}
              helperText={errors.sport}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="altezza"
              label="Altezza (cm)"
              type="number"
              value={formData.altezza}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="peso"
              label="Peso (kg)"
              type="number"
              value={formData.peso}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="data_nascita"
              label="Data di nascita"
              type="date"
              value={formData.data_nascita}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="descrizione"
              label="Descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="note"
              label="Note"
              value={formData.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSubmit} variant="contained">
          {athlete ? 'Salva' : 'Crea'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AthleteForm
