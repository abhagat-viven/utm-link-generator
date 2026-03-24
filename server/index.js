const express = require('express')
const cors = require('cors')
const path = require('path')
const { ensureDataDir } = require('./storage')
const routes = require('./routes')

const app = express()
const PORT = 3001

ensureDataDir()

app.use(cors())
app.use(express.json())
app.use(routes)

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`UTM Tracker server running on http://localhost:${PORT}`)
})
