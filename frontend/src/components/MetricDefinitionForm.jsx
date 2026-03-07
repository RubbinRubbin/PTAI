import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Divider,
} from '@mui/material'

const emptyDefinition = {
  nome: '',
  note: '',
  asse_x_nome: '',
  asse_x_unita: '',
  asse_y_nome: '',
  asse_y_unita: '',
}

function MetricDefinitionForm({ open, onClose, onSubmit, definition }) {
  const [formData, setFormData] = useState(emptyDefinition)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (definition) {
      setFormData({
        nome: definition.nome || '',
        note: definition.note || '',
        asse_x_nome: definition.asse_x_nome || '',
        asse_x_unita: definition.asse_x_unita || '',
        asse_y_nome: definition.asse_y_nome || '',
        asse_y_unita: definition.asse_y_unita || '',
      })
    } else {
      setFormData(emptyDefinition)
    }
    setErrors({})
  }, [definition, open])

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
    if (!formData.asse_x_nome.trim()) newErrors.asse_x_nome = 'Nome asse X obbligatorio'
    if (!formData.asse_x_unita.trim()) newErrors.asse_x_unita = 'Unità asse X obbligatoria'
    if (!formData.asse_y_nome.trim()) newErrors.asse_y_nome = 'Nome asse Y obbligatorio'
    if (!formData.asse_y_unita.trim()) newErrors.asse_y_unita = 'Unità asse Y obbligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {definition ? 'Modifica Metrica' : 'Nuova Metrica'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="nome"
              label="Nome Metrica"
              value={formData.nome}
              onChange={handleChange}
              error={!!errors.nome}
              helperText={errors.nome || 'Es: "Progressione Squat"'}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="note"
              label="Note / Descrizione"
              value={formData.note}
              onChange={handleChange}
              helperText="Descrizione opzionale della metrica"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Asse X (Ascisse)
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={6}>
            <TextField
              name="asse_x_nome"
              label="Nome Asse X"
              value={formData.asse_x_nome}
              onChange={handleChange}
              error={!!errors.asse_x_nome}
              helperText={errors.asse_x_nome || 'Es: "Settimane"'}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="asse_x_unita"
              label="Unità Misura X"
              value={formData.asse_x_unita}
              onChange={handleChange}
              error={!!errors.asse_x_unita}
              helperText={errors.asse_x_unita || 'Es: "settimana"'}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Asse Y (Ordinate)
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={6}>
            <TextField
              name="asse_y_nome"
              label="Nome Asse Y"
              value={formData.asse_y_nome}
              onChange={handleChange}
              error={!!errors.asse_y_nome}
              helperText={errors.asse_y_nome || 'Es: "Peso"'}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="asse_y_unita"
              label="Unità Misura Y"
              value={formData.asse_y_unita}
              onChange={handleChange}
              error={!!errors.asse_y_unita}
              helperText={errors.asse_y_unita || 'Es: "kg"'}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button onClick={handleSubmit} variant="contained">
          {definition ? 'Salva' : 'Crea'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MetricDefinitionForm
