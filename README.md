# PTAI — Personal Trainer AI

Applicazione desktop per la gestione di atleti e metriche di allenamento. Permette di tracciare progressi nel tempo attraverso grafici personalizzati, confrontare andamenti tra metriche diverse e gestire i profili clienti.

---

## Stack tecnologico

- **Frontend:** React 18, Material UI 5, Recharts, Vite
- **Backend:** Flask 3, SQLAlchemy, SQLite
- **Desktop:** Electron 28, PyInstaller

---

## Struttura del progetto

```
PTAI/
├── backend/          # API Flask
├── frontend/         # Applicazione React
├── electron/         # Wrapper desktop Electron
├── backend_dist/     # Output PyInstaller (generato, non in git)
└── package.json      # Script root
```

---

## Sviluppo locale

### Prerequisiti

- Python 3.10+
- Node.js 18+

### Installazione dipendenze

```bash
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..
cd electron && npm install && cd ..
npm install
```

### Avvio

```bash
# Avvia backend e frontend in parallelo
npm run dev
```

Il frontend sara disponibile su `http://localhost:5173`, il backend su `http://localhost:5000`.

---

## Build dell'installer

Per creare il file `.exe`:

```bash
npm run electron:dist
```

Questo comando esegue in sequenza:

1. Build del frontend React (`frontend/dist/`)
2. Build del backend Python come eseguibile standalone via PyInstaller (`backend_dist/`)
3. Packaging Electron + NSIS installer (`electron/dist/PTAI Setup x.x.x.exe`)

L'installer generato non richiede l'installazione di Python o Node.js sul PC del cliente.

### Build separati

```bash
npm run build:frontend   # Solo frontend
npm run build:backend    # Solo backend (PyInstaller)
npm run build:all        # Frontend + backend, senza packaging Electron
```

---

## Dati e backup

I dati vengono salvati in un database SQLite locale (`data/ptai.db`) nella directory dell'applicazione installata.

**Backup:** dall'interfaccia, usare il pulsante "Esporta" per scaricare un file `.json` con tutti i profili selezionati e le relative metriche.

**Ripristino:** usare il pulsante "Importa Backup" e selezionare il file `.json` esportato in precedenza. I profili gia presenti vengono automaticamente saltati.

---

## Script disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia backend e frontend in modalita sviluppo |
| `npm run dev:backend` | Solo backend Flask |
| `npm run dev:frontend` | Solo frontend Vite |
| `npm run build:frontend` | Build produzione frontend |
| `npm run build:backend` | Build eseguibile backend (PyInstaller) |
| `npm run build:all` | Build frontend + backend |
| `npm run electron:dist` | Build completo + installer `.exe` |
| `npm run electron:dev` | Avvia Electron in modalita sviluppo |
