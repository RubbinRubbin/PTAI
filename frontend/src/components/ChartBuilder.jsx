import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  TextField,
  Grid,
  IconButton,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042']

const CHART_TYPES = [
  { value: 'line', label: 'Linee' },
  { value: 'bar', label: 'Barre' },
  { value: 'scatter', label: 'Dispersione' },
  { value: 'radar', label: 'Radar' },
  { value: 'pie', label: 'Torta' },
]

function ChartBuilder({ metrics, categories, onSaveChart, savedChart, onDeleteChart }) {
  const [chartType, setChartType] = useState(savedChart?.tipo || 'line')
  const [chartName, setChartName] = useState(savedChart?.nome || '')
  const [selectedCategories, setSelectedCategories] = useState(
    savedChart?.config?.categories || []
  )
  const [selectedMetrics, setSelectedMetrics] = useState(
    savedChart?.config?.metrics || []
  )

  const availableMetricNames = [...new Set(metrics.map((m) => m.nome))]

  useEffect(() => {
    if (savedChart) {
      setChartType(savedChart.tipo)
      setChartName(savedChart.nome)
      setSelectedCategories(savedChart.config?.categories || [])
      setSelectedMetrics(savedChart.config?.metrics || [])
    }
  }, [savedChart])

  const getFilteredMetrics = () => {
    let filtered = metrics
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((m) =>
        selectedCategories.includes(m.categoria || 'Senza categoria')
      )
    }
    if (selectedMetrics.length > 0) {
      filtered = filtered.filter((m) => selectedMetrics.includes(m.nome))
    }
    return filtered
  }

  const prepareChartData = () => {
    const filtered = getFilteredMetrics()

    if (chartType === 'pie') {
      const grouped = {}
      filtered.forEach((m) => {
        if (!grouped[m.nome]) {
          grouped[m.nome] = 0
        }
        grouped[m.nome] += m.valore
      })
      return Object.entries(grouped).map(([name, value]) => ({
        name,
        value,
      }))
    }

    if (chartType === 'radar') {
      const grouped = {}
      filtered.forEach((m) => {
        if (!grouped[m.nome]) {
          grouped[m.nome] = { values: [], count: 0 }
        }
        grouped[m.nome].values.push(m.valore)
        grouped[m.nome].count++
      })
      return Object.entries(grouped).map(([name, data]) => ({
        subject: name,
        value: data.values.reduce((a, b) => a + b, 0) / data.count,
      }))
    }

    // Per line, bar, scatter - ordina per data
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.data_registrazione) - new Date(b.data_registrazione)
    )

    return sorted.map((m) => ({
      date: new Date(m.data_registrazione).toLocaleDateString('it-IT'),
      nome: m.nome,
      valore: m.valore,
      unita: m.unita_misura,
    }))
  }

  const handleSave = () => {
    if (!chartName.trim()) return

    onSaveChart({
      nome: chartName,
      tipo: chartType,
      config: {
        categories: selectedCategories,
        metrics: selectedMetrics,
      },
    })
  }

  const renderChart = () => {
    const data = prepareChartData()

    if (data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            Seleziona delle metriche per visualizzare il grafico
          </Typography>
        </Box>
      )
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="valore" stroke="#8884d8" name="Valore" />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valore" fill="#8884d8" name="Valore" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="date" name="Data" />
              <YAxis dataKey="valore" name="Valore" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Metriche" data={data} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                name="Valore medio"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={(entry) => entry.name}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {savedChart ? 'Modifica Grafico' : 'Crea Grafico'}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Nome grafico"
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo grafico</InputLabel>
            <Select
              value={chartType}
              label="Tipo grafico"
              onChange={(e) => setChartType(e.target.value)}
            >
              {CHART_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Categorie</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              label="Categorie"
              onChange={(e) => setSelectedCategories(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Metriche</InputLabel>
            <Select
              multiple
              value={selectedMetrics}
              label="Metriche"
              onChange={(e) => setSelectedMetrics(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableMetricNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!chartName.trim()}
          sx={{ mr: 1 }}
        >
          Salva Grafico
        </Button>
        {savedChart && (
          <IconButton color="error" onClick={() => onDeleteChart(savedChart.id)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {renderChart()}
    </Paper>
  )
}

export default ChartBuilder
