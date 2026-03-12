import { useState } from 'react'
import {
  Box,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Popover,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import PaletteIcon from '@mui/icons-material/Palette'

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6']

function MetricsToolbar({
  onCreateMetric,
  compareMode,
  onToggleCompare,
  chartType,
  onChartTypeChange,
  metricColors,
  onColorChange,
  definitions,
  definitionsCount,
}) {
  const [colorAnchor, setColorAnchor] = useState(null)

  const getMetricColor = (defId, index) => {
    return metricColors[defId] || COLORS[index % COLORS.length]
  }

  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      mb: 3,
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateMetric}
        sx={{ borderRadius: 2 }}
      >
        Crea Metrica
      </Button>

      <Button
        variant={compareMode ? 'contained' : 'outlined'}
        color={compareMode ? 'secondary' : 'primary'}
        startIcon={<CompareArrowsIcon />}
        onClick={onToggleCompare}
        disabled={definitionsCount < 2}
        sx={{ borderRadius: 2 }}
      >
        {compareMode ? 'Esci Sovrapposizione' : 'Sovrapponi'}
      </Button>

      <Box sx={{ flex: 1 }} />

      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={(e, val) => val && onChartTypeChange(val)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            borderRadius: 2,
            px: 1.5,
            textTransform: 'none',
          },
        }}
      >
        <ToggleButton value="line">
          <ShowChartIcon sx={{ mr: 0.5, fontSize: 18 }} /> Linee
        </ToggleButton>
        <ToggleButton value="scatter">
          <ScatterPlotIcon sx={{ mr: 0.5, fontSize: 18 }} /> Dispersione
        </ToggleButton>
      </ToggleButtonGroup>

      <Button
        variant="outlined"
        size="small"
        startIcon={<PaletteIcon />}
        onClick={(e) => setColorAnchor(e.currentTarget)}
        sx={{ borderRadius: 2 }}
      >
        Colori
      </Button>

      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Colori Metriche
          </Typography>
          {definitions.map((def, index) => (
            <Box key={def.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <input
                type="color"
                value={getMetricColor(def.id, index)}
                onChange={(e) => onColorChange(def.id, e.target.value)}
                style={{
                  width: 28,
                  height: 28,
                  border: '2px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
              <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                {def.nome}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  )
}

export { COLORS }
export default MetricsToolbar
