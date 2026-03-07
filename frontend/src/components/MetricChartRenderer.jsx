import { Paper, Typography, Box } from '@mui/material'
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const prepareChartData = (definition) => {
  if (!definition?.values?.length) return []
  return definition.values
    .map(val => ({ x: val.valore_x, y: val.valore_y }))
    .sort((a, b) => a.x - b.x)
}

const calculateDomain = (data, key) => {
  if (!data?.length) return ['auto', 'auto']
  const values = data.map(d => d[key])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const padding = range * 0.1 || 1
  return [min - padding, max + padding]
}

const CustomTooltip = ({ active, payload, definition }) => {
  if (active && payload?.length) {
    const point = payload[0].payload
    return (
      <Paper
        elevation={8}
        sx={{
          p: 1.5,
          borderRadius: 2,
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255,255,255,0.95)',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: 'text.primary' }}>
          {definition.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {definition.asse_x_nome}: <strong>{point.x}</strong> {definition.asse_x_unita}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {definition.asse_y_nome}: <strong>{point.y}</strong> {definition.asse_y_unita}
        </Typography>
      </Paper>
    )
  }
  return null
}

function MetricChartRenderer({ definition, color = '#6366f1', chartType = 'line', height = 320 }) {
  const data = prepareChartData(definition)
  const xLabel = `${definition.asse_x_nome} (${definition.asse_x_unita})`
  const yLabel = `${definition.asse_y_nome} (${definition.asse_y_unita})`

  if (data.length === 0) {
    return (
      <Box sx={{
        textAlign: 'center',
        py: 6,
        bgcolor: 'grey.50',
        borderRadius: 2,
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography color="text.secondary" variant="body2">
          Aggiungi valori per visualizzare il grafico
        </Typography>
      </Box>
    )
  }

  const xDomain = calculateDomain(data, 'x')
  const yDomain = calculateDomain(data, 'y')
  const xTicks = [...new Set(data.map(d => d.x))].sort((a, b) => a - b)
  const yTicks = [...new Set(data.map(d => d.y))].sort((a, b) => a - b)

  const axisStyle = { fontSize: 11, fill: '#94a3b8' }
  const axisLineStyle = { stroke: '#cbd5e1' }
  const gradientId = `gradient-${definition.id}`

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 15, right: 25, left: 15, bottom: 30 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.6} />
          <XAxis
            dataKey="x"
            type="number"
            domain={xDomain}
            ticks={xTicks}
            label={{ value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
            tick={axisStyle}
            axisLine={axisLineStyle}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            dataKey="y"
            domain={yDomain}
            ticks={yTicks}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
            tick={axisStyle}
            axisLine={axisLineStyle}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip definition={definition} />} />
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, fill: 'white', stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // Scatter chart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 15, right: 25, left: 15, bottom: 30 }}>
        <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.6} />
        <XAxis
          dataKey="x"
          type="number"
          domain={xDomain}
          ticks={xTicks}
          name={definition.asse_x_nome}
          label={{ value: xLabel, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
          tick={axisStyle}
          axisLine={axisLineStyle}
          tickLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={yDomain}
          ticks={yTicks}
          name={definition.asse_y_nome}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
          tick={axisStyle}
          axisLine={axisLineStyle}
          tickLine={{ stroke: '#cbd5e1' }}
        />
        <Tooltip content={<CustomTooltip definition={definition} />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          name={definition.nome}
          data={data}
          fill={color}
          shape={(props) => {
            const { cx, cy } = props
            return (
              <circle cx={cx} cy={cy} r={5} fill="white" stroke={color} strokeWidth={2} />
            )
          }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export { prepareChartData, calculateDomain }
export default MetricChartRenderer
