import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import CloseIcon from '@mui/icons-material/Close'
import AthleteCard from '../components/AthleteCard'
import AthleteForm from '../components/AthleteForm'
import { getAthletes, createAthlete, updateAthlete, deleteAthlete, exportMultipleAthletes } from '../services/api'

function Home() {
  const navigate = useNavigate()
  const [athletes, setAthletes] = useState([])
  const [filteredAthletes, setFilteredAthletes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingAthlete, setEditingAthlete] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [athleteToDelete, setAthleteToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    loadAthletes()
  }, [])

  useEffect(() => {
    const filtered = athletes.filter(
      (a) =>
        a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.sport.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredAthletes(filtered)
  }, [athletes, searchTerm])

  const loadAthletes = async () => {
    try {
      const response = await getAthletes()
      setAthletes(response.data)
    } catch (error) {
      showSnackbar('Errore nel caricamento degli atleti', 'error')
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleFormSubmit = async (data) => {
    try {
      if (editingAthlete) {
        await updateAthlete(editingAthlete.id, data)
        showSnackbar('Atleta modificato con successo')
      } else {
        await createAthlete(data)
        showSnackbar('Atleta creato con successo')
      }
      setFormOpen(false)
      setEditingAthlete(null)
      loadAthletes()
    } catch (error) {
      showSnackbar('Errore nel salvataggio', 'error')
    }
  }

  const handleEdit = (athlete) => {
    setEditingAthlete(athlete)
    setFormOpen(true)
  }

  const handleDeleteClick = (athlete) => {
    setAthleteToDelete(athlete)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteAthlete(athleteToDelete.id)
      showSnackbar('Atleta eliminato con successo')
      setDeleteDialogOpen(false)
      setAthleteToDelete(null)
      loadAthletes()
    } catch (error) {
      showSnackbar('Errore nell\'eliminazione', 'error')
    }
  }

  const handleView = (id) => {
    navigate(`/athlete/${id}`)
  }

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAthletes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredAthletes.map((a) => a.id))
    }
  }

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      showSnackbar('Seleziona almeno un atleta', 'error')
      return
    }
    try {
      const response = await exportMultipleAthletes(selectedIds)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `atleti_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSnackbar(`${selectedIds.length} profili esportati con successo`)
      setSelectionMode(false)
      setSelectedIds([])
    } catch (error) {
      showSnackbar('Errore nell\'esportazione', 'error')
    }
  }

  const handleCancelSelection = () => {
    setSelectionMode(false)
    setSelectedIds([])
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestione Atleti
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Cerca per nome, cognome o sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {!selectionMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => setSelectionMode(true)}
                disabled={athletes.length === 0}
              >
                Esporta
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingAthlete(null)
                  setFormOpen(true)
                }}
              >
                Nuovo Atleta
              </Button>
            </>
          )}
        </Box>
      </Box>

      {selectionMode && (
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 3,
            bgcolor: '#f8f9ff',
            border: '1px solid #e0e7ff',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {selectedIds.length} di {filteredAthletes.length} selezionati
          </Typography>
          <Button
            size="small"
            startIcon={<SelectAllIcon />}
            onClick={handleSelectAll}
          >
            {selectedIds.length === filteredAthletes.length ? 'Deseleziona Tutti' : 'Seleziona Tutti'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportSelected}
            disabled={selectedIds.length === 0}
            sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Esporta Selezionati
          </Button>
          <Button
            size="small"
            startIcon={<CloseIcon />}
            onClick={handleCancelSelection}
            color="inherit"
          >
            Annulla
          </Button>
        </Paper>
      )}

      {filteredAthletes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? 'Nessun atleta trovato'
              : 'Nessun atleta presente. Crea il primo!'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAthletes.map((athlete) => (
            <Grid item xs={12} sm={6} md={4} key={athlete.id}>
              <AthleteCard
                athlete={athlete}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                selectionMode={selectionMode}
                isSelected={selectedIds.includes(athlete.id)}
                onToggleSelect={handleToggleSelect}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AthleteForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingAthlete(null)
        }}
        onSubmit={handleFormSubmit}
        athlete={editingAthlete}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Conferma eliminazione</DialogTitle>
        <DialogContent>
          <Typography>
            Sei sicuro di voler eliminare {athleteToDelete?.nome} {athleteToDelete?.cognome}?
            Questa azione eliminerà anche tutte le metriche e i grafici associati.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Home
