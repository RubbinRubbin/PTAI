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
  IconButton,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'

function MetricValuesManager({
  open,
  onClose,
  definition,
  onUpdateValue,
  onDeleteValue,
  onAddValues,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ valore_x: '', valore_y: '' })
  const [newValues, setNewValues] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!open) {
      setEditingId(null)
      setEditValues({ valore_x: '', valore_y: '' })
      setNewValues([])
      setShowAddForm(false)
    }
  }, [open])

  const handleStartEdit = (value) => {
    setEditingId(value.id)
    setEditValues({
      valore_x: value.valore_x.toString(),
      valore_y: value.valore_y.toString(),
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({ valore_x: '', valore_y: '' })
  }

  const handleSaveEdit = async (valueId) => {
    if (editValues.valore_x === '' || editValues.valore_y === '') {
      alert('Compila entrambi i campi')
      return
    }
    await onUpdateValue(valueId, {
      valore_x: parseFloat(editValues.valore_x),
      valore_y: parseFloat(editValues.valore_y),
    })
    setEditingId(null)
    setEditValues({ valore_x: '', valore_y: '' })
  }

  const handleDelete = async (valueId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo valore?')) {
      await onDeleteValue(valueId)
    }
  }

  // New values handling
  const handleNewValueChange = (index, field, value) => {
    const updated = [...newValues]
    updated[index][field] = value
    setNewValues(updated)
  }

  const addNewRow = () => {
    setNewValues([...newValues, { valore_x: '', valore_y: '' }])
    setShowAddForm(true)
  }

  const removeNewRow = (index) => {
    const updated = newValues.filter((_, i) => i !== index)
    setNewValues(updated)
    if (updated.length === 0) setShowAddForm(false)
  }

  const handleSaveNewValues = async () => {
    const validValues = newValues.filter(
      (v) => v.valore_x !== '' && v.valore_y !== ''
    )
    if (validValues.length === 0) {
      alert('Inserisci almeno un valore valido')
      return
    }
    const data = validValues.map((v) => ({
      valore_x: parseFloat(v.valore_x),
      valore_y: parseFloat(v.valore_y),
    }))
    await onAddValues(data)
    setNewValues([])
    setShowAddForm(false)
  }

  if (!definition) return null

  const existingValues = definition.values || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Gestisci Valori - {definition.nome}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
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

        {/* Existing Values Table */}
        {existingValues.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>
                    <strong>{definition.asse_x_nome}</strong> ({definition.asse_x_unita})
                  </TableCell>
                  <TableCell>
                    <strong>{definition.asse_y_nome}</strong> ({definition.asse_y_unita})
                  </TableCell>
                  <TableCell align="right" width={120}>Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingValues.map((value) => (
                  <TableRow key={value.id}>
                    {editingId === value.id ? (
                      <>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editValues.valore_x}
                            onChange={(e) =>
                              setEditValues({ ...editValues, valore_x: e.target.value })
                            }
                            size="small"
                            fullWidth
                            inputProps={{ step: 'any' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editValues.valore_y}
                            onChange={(e) =>
                              setEditValues({ ...editValues, valore_y: e.target.value })
                            }
                            size="small"
                            fullWidth
                            inputProps={{ step: 'any' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSaveEdit(value.id)}
                            title="Salva"
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            title="Annulla"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{value.valore_x}</TableCell>
                        <TableCell>{value.valore_y}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(value)}
                            title="Modifica"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(value.id)}
                            title="Elimina"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', mb: 2 }}>
            <Typography color="text.secondary">
              Nessun valore presente. Aggiungi il primo!
            </Typography>
          </Paper>
        )}

        {/* Add New Values Section */}
        {showAddForm && newValues.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Nuovi Valori
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {newValues.map((value, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                  <Grid item xs={5}>
                    <TextField
                      label={definition.asse_x_nome}
                      type="number"
                      value={value.valore_x}
                      onChange={(e) => handleNewValueChange(index, 'valore_x', e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ step: 'any' }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label={definition.asse_y_nome}
                      type="number"
                      value={value.valore_y}
                      onChange={(e) => handleNewValueChange(index, 'valore_y', e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ step: 'any' }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => removeNewRow(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={addNewRow}
                variant="outlined"
                size="small"
              >
                Altra Riga
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveNewValues}
                variant="contained"
                size="small"
              >
                Salva Nuovi
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!showAddForm && (
          <Button
            startIcon={<AddIcon />}
            onClick={addNewRow}
            variant="outlined"
          >
            Aggiungi Valori
          </Button>
        )}
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  )
}

export default MetricValuesManager
