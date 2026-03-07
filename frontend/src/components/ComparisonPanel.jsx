import { Box, Paper, Typography, Chip, Collapse } from '@mui/material'
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
  Area,
  AreaChart,
} from 'recharts'
import { COLORS } from './MetricsToolbar'
import { calculateDomain } from './MetricChartRenderer'

function ComparisonPanel({
  definitions,
  selectedIds,
  onToggleSelection,
  chartType,
  metricColors,
}) {
  const getColor = (defId, index) => metricColors[defId] || COLORS[index % COLORS.length]

  const defsToCompare = definitions.filter(d => selectedIds.includes(d.id))

  const renderChart = () => {
    if (defsToCompare.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Seleziona almeno una metrica per visualizzare il grafico
          </Typography>
        </Box>
      )
    }

    // Collect all data points
    const allData = []
    defsToCompare.forEach((def, index) => {
      (def.values || []).forEach(val => {
        allData.push({
          x: val.valore_x,
          y: val.valore_y,
          metric: def.nome,
        })
      })
    })

    if (allData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Le metriche selezionate non hanno valori
          </Typography>
        </Box>
      )
    }

    // Calculate unified domain across ALL selected metrics
    const xDomain = calculateDomain(allData, 'x')
    const yDomain = calculateDomain(allData, 'y')

    const axisStyle = { fontSize: 11, fill: '#94a3b8' }
    const axisLineStyle = { stroke: '#cbd5e1' }

    // Build axis labels - combine if different
    const xLabels = [...new Set(defsToCompare.map(d => `${d.asse_x_nome} (${d.asse_x_unita})`))]
    const yLabels = [...new Set(defsToCompare.map(d => `${d.asse_y_nome} (${d.asse_y_unita})`))]
    const xLabel = xLabels.join(' / ')
    const yLabel = yLabels.join(' / ')

    // Calculate chart height based on number of metrics (min 350, max 500)
    const chartHeight = Math.min(500, Math.max(350, 300 + defsToCompare.length * 25))

    if (chartType === 'line') {
      // Group data by x value, with each metric as a separate key
      const groupedData = {}
      allData.forEach(point => {
        if (!groupedData[point.x]) groupedData[point.x] = { x: point.x }
        groupedData[point.x][point.metric] = point.y
      })
      const lineData = Object.values(groupedData).sort((a, b) => a.x - b.x)
      const metrics = [...new Set(allData.map(d => d.metric))]

      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={lineData} margin={{ top: 15, right: 30, left: 20, bottom: 35 }}>
            <defs>
              {metrics.map((metric, index) => {
                const def = defsToCompare.find(d => d.nome === metric)
                const color = def ? getColor(def.id, index) : COLORS[index % COLORS.length]
                return (
                  <linearGradient key={metric} id={`compare-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.08} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="x"
              type="number"
              domain={xDomain}
              label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
              tick={axisStyle}
              axisLine={axisLineStyle}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              domain={yDomain}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
              tick={axisStyle}
              axisLine={axisLineStyle}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              iconType="circle"
              iconSize={8}
            />
            {metrics.map((metric, index) => {
              const def = defsToCompare.find(d => d.nome === metric)
              const color = def ? getColor(def.id, index) : COLORS[index % COLORS.length]
              return (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={color}
                  strokeWidth={2.5}
                  name={metric}
                  dot={{ r: 4, fill: 'white', stroke: color, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
                  connectNulls
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // Scatter comparison
    const groupedByMetric = {}
    allData.forEach(point => {
      if (!groupedByMetric[point.metric]) groupedByMetric[point.metric] = []
      groupedByMetric[point.metric].push(point)
    })

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart margin={{ top: 15, right: 30, left: 20, bottom: 35 }}>
          <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            dataKey="x"
            type="number"
            domain={xDomain}
            label={{ value: xLabel, position: 'insideBottom', offset: -15, fontSize: 11, fill: '#64748b' }}
            tick={axisStyle}
            axisLine={axisLineStyle}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={yDomain}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
            tick={axisStyle}
            axisLine={axisLineStyle}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
            iconSize={8}
          />
          {Object.entries(groupedByMetric).map(([metricName, points], index) => {
            const def = defsToCompare.find(d => d.nome === metricName)
            const color = def ? getColor(def.id, index) : COLORS[index % COLORS.length]
            return (
              <Scatter
                key={metricName}
                name={metricName}
                data={points}
                fill={color}
                shape={(props) => {
                  const { cx, cy } = props
                  return <circle cx={cx} cy={cy} r={5} fill="white" stroke={color} strokeWidth={2} />
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )
          })}
        </ScatterChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Chip selector */}
      <Box sx={{
        mb: 2,
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Seleziona le metriche da comparare:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {definitions.map((def, index) => (
            <Chip
              key={def.id}
              label={def.nome}
              onClick={() => onToggleSelection(def.id)}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: selectedIds.includes(def.id) ? getColor(def.id, index) : 'white',
                color: selectedIds.includes(def.id) ? 'white' : 'text.primary',
                border: '1px solid',
                borderColor: selectedIds.includes(def.id) ? 'transparent' : 'grey.300',
                '&:hover': {
                  bgcolor: selectedIds.includes(def.id) ? getColor(def.id, index) : 'grey.100',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Comparison chart - show with 1+ selected metrics */}
      <Collapse in={selectedIds.length >= 1}>
        <Paper sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            {defsToCompare.length === 1
              ? defsToCompare[0].nome
              : `Comparazione ${defsToCompare.length} Metriche`}
          </Typography>
          {renderChart()}
        </Paper>
      </Collapse>
    </Box>
  )
}

export default ComparisonPanel
