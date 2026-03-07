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

function UnifiedValuesManager({
  open,
  onClose,
  definition,
  onUpdateValue,
  onDeleteValue,
  onAddValues,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({ valore_x: '', valore_y: '' })
  const [newValues, setNewValues] = useState([{ valore_x: '', valore_y: '' }])

  useEffect(() => {
    if (!open) {
      setEditingId(null)
      setEditValues({ valore_x: '', valore_y: '' })
      setNewValues([{ valore_x: '', valore_y: '' }])
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
    if (editValues.valore_x === '' || editValues.valore_y === '') return
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

  const handleNewValueChange = (index, field, value) => {
    const updated = [...newValues]
    updated[index][field] = value
    setNewValues(updated)
  }

  const addNewRow = () => {
    setNewValues([...newValues, { valore_x: '', valore_y: '' }])
  }

  const removeNewRow = (index) => {
    if (newValues.length === 1) return
    setNewValues(newValues.filter((_, i) => i !== index))
  }

  const handleSaveNewValues = async () => {
    const validValues = newValues.filter(v => v.valore_x !== '' && v.valore_y !== '')
    if (validValues.length === 0) return
    const data = validValues.map(v => ({
      valore_x: parseFloat(v.valore_x),
      valore_y: parseFloat(v.valore_y),
    }))
    await onAddValues(data)
    setNewValues([{ valore_x: '', valore_y: '' }])
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      const validValues = newValues.filter(v => v.valore_x !== '' && v.valore_y !== '')
      if (validValues.length > 0) handleSaveNewValues()
    }
  }

  if (!definition) return null

  const existingValues = (definition.values || []).slice().sort((a, b) => a.valore_x - b.valore_x)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1,
      }}>
        <Box>
          <Typography variant="h6" component="span">
            Gestisci Valori
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {definition.nome}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {/* Axis info */}
        <Paper sx={{
          p: 1.5,
          mb: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Asse X: {definition.asse_x_nome} ({definition.asse_x_unita})
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Asse Y: {definition.asse_y_nome} ({definition.asse_y_unita})
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Existing values */}
        {existingValues.length > 0 && (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ mb: 2, borderRadius: 2, maxHeight: 280, overflow: 'auto' }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    {definition.asse_x_nome} ({definition.asse_x_unita})
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    {definition.asse_y_nome} ({definition.asse_y_unita})
                  </TableCell>
                  <TableCell align="right" width={100} sx={{ bgcolor: 'grey.50', fontWeight: 700 }}>
                    Azioni
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingValues.map((value, index) => (
                  <TableRow
                    key={value.id}
                    sx={{ bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover' }}
                  >
                    {editingId === value.id ? (
                      <>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editValues.valore_x}
                            onChange={(e) => setEditValues({ ...editValues, valore_x: e.target.value })}
                            size="small"
                            fullWidth
                            inputProps={{ step: 'any' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={editValues.valore_y}
                            onChange={(e) => setEditValues({ ...editValues, valore_y: e.target.value })}
                            size="small"
                            fullWidth
                            inputProps={{ step: 'any' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleSaveEdit(value.id)}>
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{value.valore_x}</TableCell>
                        <TableCell>{value.valore_y}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleStartEdit(value)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(value.id)}>
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
        )}

        {existingValues.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', mb: 2, borderRadius: 2 }}>
            <Typography color="text.secondary" variant="body2">
              Nessun valore presente. Aggiungi il primo qui sotto!
            </Typography>
          </Paper>
        )}

        {/* Add new values - always visible */}
        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Aggiungi Nuovi Valori
          </Typography>
        </Divider>

        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {newValues.map((value, index) => (
            <Grid container spacing={1.5} key={index} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={5}>
                <TextField
                  label={`${definition.asse_x_nome} (${definition.asse_x_unita})`}
                  type="number"
                  value={value.valore_x}
                  onChange={(e) => handleNewValueChange(index, 'valore_x', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  fullWidth
                  size="small"
                  inputProps={{ step: 'any' }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label={`${definition.asse_y_nome} (${definition.asse_y_unita})`}
                  type="number"
                  value={value.valore_y}
                  onChange={(e) => handleNewValueChange(index, 'valore_y', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  fullWidth
                  size="small"
                  inputProps={{ step: 'any' }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton
                  onClick={() => removeNewRow(index)}
                  color="error"
                  size="small"
                  disabled={newValues.length === 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          <Button startIcon={<AddIcon />} onClick={addNewRow} variant="outlined" size="small">
            Altra Riga
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveNewValues}
            variant="contained"
            size="small"
            disabled={!newValues.some(v => v.valore_x !== '' && v.valore_y !== '')}
          >
            Salva Nuovi
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UnifiedValuesManager
