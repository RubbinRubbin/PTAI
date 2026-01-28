import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F']

function ChartComparison({ metrics }) {
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [chartType, setChartType] = useState('line')

  const availableMetricNames = [...new Set(metrics.map((m) => m.nome))]

  const prepareComparisonData = () => {
    if (selectedMetrics.length === 0) return []

    // Raggruppa per data
    const dateMap = {}

    metrics
      .filter((m) => selectedMetrics.includes(m.nome))
      .forEach((m) => {
        const date = new Date(m.data_registrazione).toLocaleDateString('it-IT')
        if (!dateMap[date]) {
          dateMap[date] = { date }
        }
        dateMap[date][m.nome] = m.valore
      })

    return Object.values(dateMap).sort(
      (a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'))
    )
  }

  const renderChart = () => {
    const data = prepareComparisonData()

    if (data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            Seleziona almeno due metriche da comparare
          </Typography>
        </Box>
      )
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedMetrics.map((metricName, index) => (
              <Line
                key={metricName}
                type="monotone"
                dataKey={metricName}
                stroke={COLORS[index % COLORS.length]}
                name={metricName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedMetrics.map((metricName, index) => (
            <Bar
              key={metricName}
              dataKey={metricName}
              fill={COLORS[index % COLORS.length]}
              name={metricName}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comparazione Metriche
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth size="small">
            <InputLabel>Seleziona metriche da comparare</InputLabel>
            <Select
              multiple
              value={selectedMetrics}
              label="Seleziona metriche da comparare"
              onChange={(e) => setSelectedMetrics(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value, index) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{ backgroundColor: COLORS[index % COLORS.length], color: 'white' }}
                    />
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
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo grafico</InputLabel>
            <Select
              value={chartType}
              label="Tipo grafico"
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="line">Linee</MenuItem>
              <MenuItem value="bar">Barre</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {renderChart()}
    </Paper>
  )
}

export default ChartComparison
