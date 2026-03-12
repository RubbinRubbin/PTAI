import { Box, Paper, Typography, Chip, Collapse } from '@mui/material'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { COLORS } from './MetricsToolbar'

function ComparisonPanel({
  definitions,
  selectedIds,
  onToggleSelection,
  metricColors,
}) {
  const getColor = (defId, index) => metricColors[defId] || COLORS[index % COLORS.length]

  const defsToCompare = definitions.filter(d => selectedIds.includes(d.id))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null
    return (
      <Paper sx={{
        p: 1.5,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
      }}>
        {payload.map((entry, i) => {
          const origX = entry.payload[`${entry.name}_origX`]
          const origY = entry.payload[`${entry.name}_origY`]
          const def = defsToCompare.find(d => d.nome === entry.name)
          const unitX = def ? def.asse_x_unita : ''
          const unitY = def ? def.asse_y_unita : ''
          return (
            <Typography key={i} variant="body2" sx={{ color: entry.color, fontWeight: 600 }}>
              {entry.name}: {origX}{unitX} / {origY}{unitY}
            </Typography>
          )
        })}
      </Paper>
    )
  }

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

    const hasData = defsToCompare.some(d => (d.values || []).length > 0)
    if (!hasData) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Le metriche selezionate non hanno valori
          </Typography>
        </Box>
      )
    }

    // For each metric, normalize both X and Y to 0-1 range
    // Then merge all into a single dataset indexed by normalized position (0 to 100 steps)
    const STEPS = 100

    // Build normalized points per metric
    const metricNormalized = {}
    defsToCompare.forEach(def => {
      const vals = (def.values || []).slice().sort((a, b) => a.valore_x - b.valore_x)
      if (vals.length === 0) return

      const xMin = vals[0].valore_x
      const xMax = vals[vals.length - 1].valore_x
      const xRange = xMax - xMin || 1

      const yValues = vals.map(v => v.valore_y)
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)
      const yRange = yMax - yMin || 1

      // Create normalized points
      metricNormalized[def.nome] = vals.map(v => ({
        nx: (v.valore_x - xMin) / xRange,
        ny: (v.valore_y - yMin) / yRange,
        origX: v.valore_x,
        origY: v.valore_y,
      }))
    })

    // Build chart data: sample at regular intervals using linear interpolation
    const chartData = []
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS
      const point = { t: Math.round(t * 100) }

      defsToCompare.forEach(def => {
        const pts = metricNormalized[def.nome]
        if (!pts || pts.length === 0) return

        // Find the two surrounding points for interpolation
        let before = null
        let after = null
        for (let j = 0; j < pts.length; j++) {
          if (pts[j].nx <= t) before = pts[j]
          if (pts[j].nx >= t && after === null) after = pts[j]
        }

        if (before && after) {
          const segRange = after.nx - before.nx
          const ratio = segRange === 0 ? 0 : (t - before.nx) / segRange
          point[def.nome] = Math.round((before.ny + ratio * (after.ny - before.ny)) * 1000) / 1000
          // Store original values of nearest point for tooltip
          const nearest = Math.abs(t - before.nx) <= Math.abs(t - after.nx) ? before : after
          point[`${def.nome}_origX`] = nearest.origX
          point[`${def.nome}_origY`] = nearest.origY
        } else if (before) {
          point[def.nome] = before.ny
          point[`${def.nome}_origX`] = before.origX
          point[`${def.nome}_origY`] = before.origY
        } else if (after) {
          point[def.nome] = after.ny
          point[`${def.nome}_origX`] = after.origX
          point[`${def.nome}_origY`] = after.origY
        }
      })

      chartData.push(point)
    }

    const chartHeight = Math.min(500, Math.max(350, 300 + defsToCompare.length * 25))

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 15 }}>
          <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickLine={false}
            height={5}
          />
          <YAxis
            domain={[0, 1]}
            tick={false}
            axisLine={false}
            tickLine={false}
            width={5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
            iconSize={8}
          />
          {defsToCompare.map((def, index) => {
            const color = getColor(def.id, index)
            return (
              <Line
                key={def.id}
                type="monotone"
                dataKey={def.nome}
                stroke={color}
                strokeWidth={2.5}
                name={def.nome}
                dot={false}
                activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }}
                connectNulls
                animationDuration={800}
                animationEasing="ease-out"
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{
        mb: 2,
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
      }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Seleziona le metriche da sovrapporre:
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

      <Collapse in={selectedIds.length >= 1}>
        <Paper sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            {defsToCompare.length === 1
              ? defsToCompare[0].nome
              : `Sovrapposizione ${defsToCompare.length} Metriche`}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Curve normalizzate per confrontare le pendenze. Passa il mouse per i valori reali.
          </Typography>
          {renderChart()}
        </Paper>
      </Collapse>
    </Box>
  )
}

export default ComparisonPanel
