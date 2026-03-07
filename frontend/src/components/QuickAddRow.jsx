import { useState, useRef } from 'react'
import { Box, TextField, IconButton, Fade } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

function QuickAddRow({ definition, onAdd }) {
  const [valoreX, setValoreX] = useState('')
  const [valoreY, setValoreY] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const xRef = useRef(null)

  const isValid = valoreX !== '' && valoreY !== ''

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await onAdd(definition.id, {
        valore_x: parseFloat(valoreX),
        valore_y: parseFloat(valoreY),
      })
      setValoreX('')
      setValoreY('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 1200)
      setTimeout(() => xRef.current?.focus(), 50)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <Box sx={{
      display: 'flex',
      gap: 1,
      alignItems: 'center',
      px: 2,
      py: 1.5,
      bgcolor: 'grey.50',
      borderTop: '1px solid',
      borderColor: 'grey.100',
    }}>
      <TextField
        inputRef={xRef}
        size="small"
        label={definition.asse_x_nome}
        type="number"
        value={valoreX}
        onChange={(e) => setValoreX(e.target.value)}
        onKeyDown={handleKeyDown}
        inputProps={{ step: 'any' }}
        sx={{ flex: 1 }}
        placeholder={definition.asse_x_unita}
      />
      <TextField
        size="small"
        label={definition.asse_y_nome}
        type="number"
        value={valoreY}
        onChange={(e) => setValoreY(e.target.value)}
        onKeyDown={handleKeyDown}
        inputProps={{ step: 'any' }}
        sx={{ flex: 1 }}
        placeholder={definition.asse_y_unita}
      />
      <Fade in={!success}>
        <IconButton
          color="primary"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          sx={{
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.1)' },
          }}
        >
          <AddCircleIcon />
        </IconButton>
      </Fade>
      <Fade in={success}>
        <CheckCircleIcon sx={{ color: 'success.main', position: 'absolute', right: 20 }} />
      </Fade>
    </Box>
  )
}

export default QuickAddRow
