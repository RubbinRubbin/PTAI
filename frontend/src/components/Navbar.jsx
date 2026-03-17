import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'

function Navbar() {
  const navigate = useNavigate()

  return (
    <AppBar position="static">
      <Toolbar>
        <FitnessCenterIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          PTAI - Personal Trainer AI
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
