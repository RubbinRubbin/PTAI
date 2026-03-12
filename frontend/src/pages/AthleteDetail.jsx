import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Typography,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Slide,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AthleteHeader from '../components/AthleteHeader'
import MetricsToolbar, { COLORS } from '../components/MetricsToolbar'
import MetricCard from '../components/MetricCard'
import ComparisonPanel from '../components/ComparisonPanel'
import MetricDefinitionForm from '../components/MetricDefinitionForm'
import UnifiedValuesManager from '../components/UnifiedValuesManager'
import MetricChartRenderer from '../components/MetricChartRenderer'
import {
  getAthlete,
  getMetricDefinitions,
  createMetricDefinition,
  updateMetricDefinition,
  deleteMetricDefinition,
  duplicateMetricDefinition,
  addMetricValues,
  updateMetricValue,
  deleteMetricValue,
  exportAthlete,
} from '../services/api'

const SlideUp = (props) => <Slide direction="up" {...props} />

function AthleteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [athlete, setAthlete] = useState(null)
  const [definitions, setDefinitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Forms
  const [definitionFormOpen, setDefinitionFormOpen] = useState(false)
  const [editingDefinition, setEditingDefinition] = useState(null)
  const [valuesManagerOpen, setValuesManagerOpen] = useState(false)
  const [selectedDefinitionForValues, setSelectedDefinitionForValues] = useState(null)

  // Chart settings
  const [chartType, setChartType] = useState('line')
  const [metricColors, setMetricColors] = useState({})
  const [expandedChart, setExpandedChart] = useState(null)

  // Comparison
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [athleteRes, definitionsRes] = await Promise.all([
        getAthlete(id),
        getMetricDefinitions(id),
      ])
      setAthlete(athleteRes.data)
      setDefinitions(definitionsRes.data)

      // Update selected definition if values manager is open (to refresh data)
      if (selectedDefinitionForValues) {
        const updated = definitionsRes.data.find(d => d.id === selectedDefinitionForValues.id)
        if (updated) setSelectedDefinitionForValues(updated)
      }
    } catch (error) {
      showSnackbar('Errore nel caricamento dei dati', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const getMetricColor = (defId, index) => {
    return metricColors[defId] || COLORS[index % COLORS.length]
  }

  // --- Handlers ---

  const handleDefinitionSubmit = async (data) => {
    try {
      if (editingDefinition) {
        await updateMetricDefinition(editingDefinition.id, data)
        showSnackbar('Metrica modificata con successo')
      } else {
        const response = await createMetricDefinition(id, data)
        showSnackbar('Metrica creata con successo')
        // Auto-open values manager for the new metric
        setSelectedDefinitionForValues(response.data)
        setValuesManagerOpen(true)
      }
      setDefinitionFormOpen(false)
      setEditingDefinition(null)
      loadData()
    } catch (error) {
      showSnackbar('Errore nel salvataggio della metrica', 'error')
    }
  }

  const handleDefinitionDelete = async (definitionId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa metrica e tutti i suoi valori?')) return
    try {
      await deleteMetricDefinition(definitionId)
      showSnackbar('Metrica eliminata')
      loadData()
    } catch (error) {
      showSnackbar("Errore nell'eliminazione", 'error')
    }
  }

  const handleDefinitionDuplicate = async (definitionId) => {
    try {
      await duplicateMetricDefinition(definitionId)
      showSnackbar('Metrica duplicata con successo')
      loadData()
    } catch (error) {
      showSnackbar('Errore nella duplicazione', 'error')
    }
  }

  const handleQuickAdd = async (definitionId, value) => {
    try {
      await addMetricValues(definitionId, [value])
      showSnackbar('Valore aggiunto')
      loadData()
    } catch (error) {
      showSnackbar("Errore nell'aggiunta del valore", 'error')
    }
  }

  const handleValueUpdate = async (valueId, data) => {
    try {
      await updateMetricValue(valueId, data)
      showSnackbar('Valore aggiornato')
      loadData()
    } catch (error) {
      showSnackbar("Errore nell'aggiornamento", 'error')
    }
  }

  const handleValueDelete = async (valueId) => {
    try {
      await deleteMetricValue(valueId)
      showSnackbar('Valore eliminato')
      loadData()
    } catch (error) {
      showSnackbar("Errore nell'eliminazione", 'error')
    }
  }

  const handleAddValues = async (values) => {
    try {
      await addMetricValues(selectedDefinitionForValues.id, values)
      showSnackbar(`${values.length} valore/i aggiunto/i con successo`)
      loadData()
    } catch (error) {
      showSnackbar("Errore nell'aggiunta dei valori", 'error')
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportAthlete(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${athlete.cognome}_${athlete.nome}_backup.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSnackbar('Esportazione completata')
    } catch (error) {
      showSnackbar("Errore nell'esportazione", 'error')
    }
  }

  const toggleCompareSelection = (definitionId) => {
    setSelectedForCompare(prev =>
      prev.includes(definitionId)
        ? prev.filter(n => n !== definitionId)
        : [...prev, definitionId]
    )
  }

  // --- Render ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!athlete) {
    return (
      <Container>
        <Alert severity="error">Atleta non trovato</Alert>
      </Container>
    )
  }

  const expandedDefinition = definitions.find(d => d.id === expandedChart)

  return (
    <Container maxWidth="xl">
      <AthleteHeader
        athlete={athlete}
        onBack={() => navigate('/')}
        onExport={handleExport}
      />

      <MetricsToolbar
        onCreateMetric={() => {
          setEditingDefinition(null)
          setDefinitionFormOpen(true)
        }}
        compareMode={compareMode}
        onToggleCompare={() => {
          setCompareMode(!compareMode)
          if (compareMode) setSelectedForCompare([])
        }}
        chartType={chartType}
        onChartTypeChange={setChartType}
        metricColors={metricColors}
        onColorChange={(defId, color) => setMetricColors(prev => ({ ...prev, [defId]: color }))}
        definitions={definitions}
        definitionsCount={definitions.length}
      />

      {/* Comparison Panel */}
      {compareMode && (
        <ComparisonPanel
          definitions={definitions}
          selectedIds={selectedForCompare}
          onToggleSelection={toggleCompareSelection}
          metricColors={metricColors}
        />
      )}

      {/* Metric Cards Grid */}
      {definitions.length === 0 ? (
        <Box sx={{
          textAlign: 'center',
          py: 8,
          bgcolor: 'grey.50',
          borderRadius: 3,
          border: '1px dashed',
          borderColor: 'grey.300',
        }}>
          <Typography color="text.secondary" variant="h6" fontWeight={400}>
            Crea una metrica per iniziare a tracciare i progressi
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Clicca "Crea Metrica" per definire la prima metrica dell'atleta
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {definitions.map((def, index) => (
            <Grid item xs={12} md={6} key={def.id}>
              <MetricCard
                definition={def}
                color={getMetricColor(def.id, index)}
                chartType={chartType}
                onQuickAdd={handleQuickAdd}
                onDefinitionEdit={(d) => {
                  setEditingDefinition(d)
                  setDefinitionFormOpen(true)
                }}
                onDefinitionDelete={handleDefinitionDelete}
                onDefinitionDuplicate={handleDefinitionDuplicate}
                onOpenValuesManager={(d) => {
                  setSelectedDefinitionForValues(d)
                  setValuesManagerOpen(true)
                }}
                onExpand={setExpandedChart}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.includes(def.id)}
                onToggleCompare={toggleCompareSelection}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Definition Form Dialog */}
      <MetricDefinitionForm
        open={definitionFormOpen}
        onClose={() => {
          setDefinitionFormOpen(false)
          setEditingDefinition(null)
        }}
        onSubmit={handleDefinitionSubmit}
        definition={editingDefinition}
      />

      {/* Unified Values Manager Dialog */}
      <UnifiedValuesManager
        open={valuesManagerOpen}
        onClose={() => {
          setValuesManagerOpen(false)
          setSelectedDefinitionForValues(null)
        }}
        definition={selectedDefinitionForValues}
        onUpdateValue={handleValueUpdate}
        onDeleteValue={handleValueDelete}
        onAddValues={handleAddValues}
      />

      {/* Expanded Chart Dialog */}
      <Dialog
        open={expandedChart !== null}
        onClose={() => setExpandedChart(null)}
        fullScreen
        TransitionComponent={SlideUp}
      >
        {expandedDefinition && (
          <>
            <DialogTitle sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'grey.200',
            }}>
              <Typography variant="h6" fontWeight={700}>
                {expandedDefinition.nome}
              </Typography>
              <IconButton onClick={() => setExpandedChart(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <Box sx={{ width: '100%', maxWidth: 1200 }}>
                <MetricChartRenderer
                  definition={expandedDefinition}
                  color={getMetricColor(expandedDefinition.id, definitions.indexOf(expandedDefinition))}
                  chartType={chartType}
                  height={500}
                />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AthleteDetail
