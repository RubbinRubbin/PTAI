import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import SettingsIcon from '@mui/icons-material/Settings'
import TimelineIcon from '@mui/icons-material/Timeline'
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import MetricDefinitionForm from '../components/MetricDefinitionForm'
import MetricValuesForm from '../components/MetricValuesForm'
import {
  getAthlete,
  getMetricDefinitions,
  createMetricDefinition,
  updateMetricDefinition,
  deleteMetricDefinition,
  addMetricValues,
  deleteMetricValue,
  exportAthlete,
} from '../services/api'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042']

function AthleteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [athlete, setAthlete] = useState(null)
  const [definitions, setDefinitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Forms
  const [definitionFormOpen, setDefinitionFormOpen] = useState(false)
  const [valuesFormOpen, setValuesFormOpen] = useState(false)
  const [editingDefinition, setEditingDefinition] = useState(null)
  const [selectedDefinitionForValues, setSelectedDefinitionForValues] = useState(null)

  // Chart settings
  const [chartType, setChartType] = useState('scatter')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [athleteRes, definitionsRes] = await Promise.all([
        getAthlete(id),
        getMetricDefinitions(id),
      ])
      setAthlete(athleteRes.data)
      setDefinitions(definitionsRes.data)
    } catch (error) {
      showSnackbar('Errore nel caricamento dei dati', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleDefinitionSubmit = async (data) => {
    try {
      if (editingDefinition) {
        await updateMetricDefinition(editingDefinition.id, data)
        showSnackbar('Metrica modificata con successo')
      } else {
        await createMetricDefinition(id, data)
        showSnackbar('Metrica creata con successo')
      }
      setDefinitionFormOpen(false)
      setEditingDefinition(null)
      loadData()
    } catch (error) {
      showSnackbar('Errore nel salvataggio della metrica', 'error')
    }
  }

  const handleValuesSubmit = async (values) => {
    try {
      await addMetricValues(selectedDefinitionForValues.id, values)
      showSnackbar(`${values.length} valore/i aggiunto/i con successo`)
      setValuesFormOpen(false)
      setSelectedDefinitionForValues(null)
      loadData()
    } catch (error) {
      showSnackbar('Errore nell\'aggiunta dei valori', 'error')
    }
  }

  const handleDefinitionDelete = async (definitionId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa metrica e tutti i suoi valori?')) return
    try {
      await deleteMetricDefinition(definitionId)
      showSnackbar('Metrica eliminata')
      loadData()
    } catch (error) {
      showSnackbar('Errore nell\'eliminazione', 'error')
    }
  }

  const handleValueDelete = async (valueId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo valore?')) return
    try {
      await deleteMetricValue(valueId)
      showSnackbar('Valore eliminato')
      loadData()
    } catch (error) {
      showSnackbar('Errore nell\'eliminazione', 'error')
    }
  }

  const handleExport = async () => {
    try {
      const response = await exportAthlete(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${athlete.cognome}_${athlete.nome}_profilo.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showSnackbar('Esportazione completata')
    } catch (error) {
      showSnackbar('Errore nell\'esportazione', 'error')
    }
  }

  const toggleCompareSelection = (definitionId) => {
    setSelectedForCompare(prev =>
      prev.includes(definitionId)
        ? prev.filter(n => n !== definitionId)
        : [...prev, definitionId]
    )
  }

  // Prepare chart data
  const prepareChartData = () => {
    const defsToShow = compareMode && selectedForCompare.length > 0
      ? definitions.filter(d => selectedForCompare.includes(d.id))
      : definitions

    if (compareMode && selectedForCompare.length > 0) {
      // Multiple metrics comparison
      const allData = []
      defsToShow.forEach((def, index) => {
        def.values.forEach(val => {
          allData.push({
            x: val.valore_x,
            y: val.valore_y,
            metric: def.nome,
            color: COLORS[index % COLORS.length],
          })
        })
      })
      return allData
    }

    // Single metric or all metrics
    const allData = []
    defsToShow.forEach((def) => {
      def.values.forEach(val => {
        allData.push({
          x: val.valore_x,
          y: val.valore_y,
          metric: def.nome,
        })
      })
    })
    return allData
  }

  const renderChart = () => {
    const data = prepareChartData()

    if (data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography color="text.secondary">
            Crea una metrica e aggiungi valori per visualizzare il grafico
          </Typography>
        </Box>
      )
    }

    // Get axis labels from first definition (or combined if comparing)
    const defsToShow = compareMode && selectedForCompare.length > 0
      ? definitions.filter(d => selectedForCompare.includes(d.id))
      : definitions.filter(d => d.values.length > 0)

    const xLabel = defsToShow.length > 0 ? `${defsToShow[0].asse_x_nome} (${defsToShow[0].asse_x_unita})` : 'X'
    const yLabel = defsToShow.length > 0 ? `${defsToShow[0].asse_y_nome} (${defsToShow[0].asse_y_unita})` : 'Y'

    if (chartType === 'line') {
      // Group by metric for line chart
      const groupedData = {}
      data.forEach(point => {
        if (!groupedData[point.x]) groupedData[point.x] = { x: point.x }
        groupedData[point.x][point.metric] = point.y
      })
      const lineData = Object.values(groupedData).sort((a, b) => a.x - b.x)

      const metrics = [...new Set(data.map(d => d.metric))]

      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={COLORS[index % COLORS.length]}
                name={metric}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // Scatter chart
    if (compareMode && selectedForCompare.length > 0) {
      // Multiple series
      const groupedByMetric = {}
      data.forEach(point => {
        if (!groupedByMetric[point.metric]) groupedByMetric[point.metric] = []
        groupedByMetric[point.metric].push(point)
      })

      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="y" type="number" label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {Object.entries(groupedByMetric).map(([metricName, points], index) => (
              <Scatter
                key={metricName}
                name={metricName}
                data={points}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
          <YAxis dataKey="y" type="number" label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Valori" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

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

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Torna alla lista
        </Button>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4">
                {athlete.nome} {athlete.cognome}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={athlete.sport} color="primary" sx={{ mr: 1 }} />
                <Chip label={`${athlete.eta} anni`} variant="outlined" sx={{ mr: 1 }} />
                {athlete.altezza && (
                  <Chip label={`${athlete.altezza} cm`} variant="outlined" sx={{ mr: 1 }} />
                )}
                {athlete.peso && (
                  <Chip label={`${athlete.peso} kg`} variant="outlined" />
                )}
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
                onClick={handleExport}
                color="success"
              >
                Esporta Excel
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingDefinition(null)
              setDefinitionFormOpen(true)
            }}
          >
            Crea Metrica
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
            disabled={definitions.length === 0}
          >
            Modifica Grafico
          </Button>
          <Button
            variant={compareMode ? 'contained' : 'outlined'}
            color={compareMode ? 'secondary' : 'primary'}
            startIcon={<CompareArrowsIcon />}
            onClick={() => {
              setCompareMode(!compareMode)
              if (compareMode) setSelectedForCompare([])
            }}
            disabled={definitions.length < 2}
          >
            {compareMode ? 'Esci Comparazione' : 'Compara Metriche'}
          </Button>
        </Box>

        {/* Comparison Selection */}
        {compareMode && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
              Seleziona le metriche da comparare:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {definitions.map((def, index) => (
                <Chip
                  key={def.id}
                  label={def.nome}
                  onClick={() => toggleCompareSelection(def.id)}
                  color={selectedForCompare.includes(def.id) ? 'primary' : 'default'}
                  variant={selectedForCompare.includes(def.id) ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: selectedForCompare.includes(def.id) ? COLORS[index % COLORS.length] : 'white',
                    color: selectedForCompare.includes(def.id) ? 'white' : 'inherit',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Chart */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Grafico {compareMode && selectedForCompare.length > 0 ? '(Comparazione)' : ''}
          </Typography>
          {renderChart()}
        </Box>

        {/* Metrics Cards */}
        <Typography variant="h6" gutterBottom>
          Metriche ({definitions.length})
        </Typography>

        {definitions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography color="text.secondary">
              Nessuna metrica creata. Crea la prima!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {definitions.map((def) => (
              <Grid item xs={12} md={6} lg={4} key={def.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {def.nome}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="primary">
                        <strong>Asse X:</strong> {def.asse_x_nome} ({def.asse_x_unita})
                      </Typography>
                      <Typography variant="body2" color="secondary">
                        <strong>Asse Y:</strong> {def.asse_y_nome} ({def.asse_y_unita})
                      </Typography>
                    </Box>
                    <Chip
                      icon={<TimelineIcon />}
                      label={`${def.values.length} valori`}
                      size="small"
                      color={def.values.length > 0 ? 'success' : 'default'}
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedDefinitionForValues(def)
                        setValuesFormOpen(true)
                      }}
                    >
                      Aggiungi Valori
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingDefinition(def)
                        setDefinitionFormOpen(true)
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDefinitionDelete(def.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

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

      {/* Values Form Dialog */}
      <MetricValuesForm
        open={valuesFormOpen}
        onClose={() => {
          setValuesFormOpen(false)
          setSelectedDefinitionForValues(null)
        }}
        onSubmit={handleValuesSubmit}
        definition={selectedDefinitionForValues}
      />

      {/* Chart Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Impostazioni Grafico</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Tipo di grafico</InputLabel>
            <Select
              value={chartType}
              label="Tipo di grafico"
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="scatter">Dispersione (Scatter)</MenuItem>
              <MenuItem value="line">Linee</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default AthleteDetail
