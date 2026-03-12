const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn, execFile } = require('child_process')
const http = require('http')

let mainWindow
let backendProcess

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'PTAI - Personal Trainer AI',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // When packaged, files are in resources/frontend/dist
    const frontendPath = app.isPackaged
      ? path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
      : path.join(__dirname, '..', 'frontend', 'dist', 'index.html')
    mainWindow.loadFile(frontendPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function getBackendPath() {
  if (isDev) {
    return null // Use python directly in dev
  }

  // In production (packaged app), look for the PyInstaller exe
  const possiblePaths = [
    // When running from electron-builder output
    path.join(process.resourcesPath, 'backend', 'ptai_backend.exe'),
    // Fallback: relative to app
    path.join(__dirname, '..', 'backend_dist', 'ptai_backend', 'ptai_backend.exe'),
  ]

  for (const p of possiblePaths) {
    try {
      require('fs').accessSync(p)
      return p
    } catch (e) {
      continue
    }
  }

  return null
}

function startBackend() {
  if (isDev) {
    // Development: use Python directly
    const pythonPath = process.platform === 'win32' ? 'python' : 'python3'
    const scriptPath = path.join(__dirname, '..', 'backend', 'app.py')

    backendProcess = spawn(pythonPath, [scriptPath], {
      cwd: path.join(__dirname, '..', 'backend'),
      env: { ...process.env, FLASK_ENV: 'development' },
    })
  } else {
    // Production: use PyInstaller exe
    const exePath = getBackendPath()
    if (!exePath) {
      console.error('Backend exe not found!')
      return
    }

    const exeDir = path.dirname(exePath)
    backendProcess = execFile(exePath, [], {
      cwd: exeDir,
      env: { ...process.env, FLASK_ENV: 'production' },
    })
  }

  backendProcess.stdout?.on('data', (data) => {
    console.log(`Backend: ${data}`)
  })

  backendProcess.stderr?.on('data', (data) => {
    console.error(`Backend: ${data}`)
  })

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`)
  })
}

function stopBackend() {
  if (backendProcess) {
    if (process.platform === 'win32') {
      // On Windows, kill the process tree
      spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t'])
    } else {
      backendProcess.kill()
    }
    backendProcess = null
  }
}

function waitForBackend(retries = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      const req = http.get('http://localhost:5000/health', (res) => {
        if (res.statusCode === 200) {
          resolve()
        } else {
          retry()
        }
      })
      req.on('error', () => retry())
      req.setTimeout(1000, () => {
        req.destroy()
        retry()
      })
    }

    const retry = () => {
      attempts++
      if (attempts >= retries) {
        reject(new Error('Backend did not start in time'))
      } else {
        setTimeout(check, 500)
      }
    }

    check()
  })
}

app.whenReady().then(async () => {
  startBackend()

  try {
    await waitForBackend()
  } catch (e) {
    console.error('Failed to start backend:', e.message)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopBackend()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopBackend()
})
