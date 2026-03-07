import { Box, Card, Typography, IconButton, Chip, Checkbox, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ListAltIcon from '@mui/icons-material/ListAlt'
import MetricChartRenderer from './MetricChartRenderer'
import QuickAddRow from './QuickAddRow'

function MetricCard({
  definition,
  color,
  chartType,
  onQuickAdd,
  onDefinitionEdit,
  onDefinitionDelete,
  onDefinitionDuplicate,
  onOpenValuesManager,
  onExpand,
  compareMode,
  isSelectedForCompare,
  onToggleCompare,
}) {
  const valuesCount = definition.values?.length || 0
  const lastValue = valuesCount > 0
    ? definition.values[definition.values.length - 1]
    : null

  return (
    <Card sx={{
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s ease, transform 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
      },
      border: 'none',
      position: 'relative',
    }}>
      {/* Gradient accent bar */}
      <Box sx={{
        height: 4,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
      }} />

      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        pt: 1.5,
        pb: 0.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          {compareMode && (
            <Checkbox
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(definition.id)}
              size="small"
              sx={{ p: 0.5 }}
            />
          )}
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {definition.nome}
          </Typography>
          <Chip
            label={`${valuesCount} ${valuesCount === 1 ? 'valore' : 'valori'}`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              bgcolor: valuesCount > 0 ? `${color}15` : 'grey.100',
              color: valuesCount > 0 ? color : 'text.secondary',
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', ml: 1 }}>
          <Tooltip title="Gestisci Valori" arrow>
            <IconButton size="small" onClick={() => onOpenValuesManager(definition)}>
              <ListAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifica Metrica" arrow>
            <IconButton size="small" onClick={() => onDefinitionEdit(definition)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplica" arrow>
            <IconButton size="small" onClick={() => onDefinitionDuplicate(definition.id)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ingrandisci" arrow>
            <IconButton size="small" onClick={() => onExpand(definition.id)}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Elimina" arrow>
            <IconButton size="small" color="error" onClick={() => onDefinitionDelete(definition.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Note + Axis labels */}
      <Box sx={{ px: 2, pb: 1 }}>
        {definition.note && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontStyle: 'italic', lineHeight: 1.4 }}>
            {definition.note}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled">
          {definition.asse_x_nome} ({definition.asse_x_unita}) vs {definition.asse_y_nome} ({definition.asse_y_unita})
        </Typography>
      </Box>

      {/* Chart */}
      <Box sx={{ px: 1 }}>
        <MetricChartRenderer
          definition={definition}
          color={color}
          chartType={chartType}
          height={320}
        />
      </Box>

      {/* Quick Add Row */}
      <QuickAddRow definition={definition} onAdd={onQuickAdd} />
    </Card>
  )
}

export default MetricCard
