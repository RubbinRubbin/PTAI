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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import AthleteCard from '../components/AthleteCard'
import AthleteForm from '../components/AthleteForm'
import { getAthletes, createAthlete, updateAthlete, deleteAthlete } from '../services/api'

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
        </Box>
      </Box>

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
