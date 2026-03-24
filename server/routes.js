const express = require('express')
const crypto = require('crypto')
const { getLinks, saveLink, getClicks, saveClick } = require('./storage')

const router = express.Router()

function generateShortCode(length = 8) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length)
}

// Create a new short link
router.post('/api/links', (req, res) => {
  const { baseUrl, params } = req.body

  if (!baseUrl) {
    return res.status(400).json({ error: 'baseUrl is required' })
  }

  try {
    const url = new URL(baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })
    }

    const shortCode = generateShortCode()
    const link = {
      id: shortCode,
      baseUrl,
      params: params || {},
      fullUrl: url.toString(),
      shortCode,
      createdAt: new Date().toISOString(),
    }

    saveLink(link)
    res.status(201).json(link)
  } catch {
    res.status(400).json({ error: 'Invalid URL' })
  }
})

// List all links with click counts
router.get('/api/links', (req, res) => {
  const links = getLinks()
  const clicks = getClicks()
  const search = (req.query.search || '').toLowerCase()

  const enriched = links.map((link) => ({
    ...link,
    clickCount: clicks.filter((c) => c.shortCode === link.shortCode).length,
  }))

  if (search) {
    const filtered = enriched.filter(
      (link) =>
        link.baseUrl.toLowerCase().includes(search) ||
        link.fullUrl.toLowerCase().includes(search) ||
        (link.params.utm_campaign || '').toLowerCase().includes(search) ||
        (link.params.utm_source || '').toLowerCase().includes(search)
    )
    return res.json(filtered)
  }

  res.json(enriched)
})

// Get a single link with click data
router.get('/api/links/:shortCode', (req, res) => {
  const links = getLinks()
  const link = links.find((l) => l.shortCode === req.params.shortCode)

  if (!link) {
    return res.status(404).json({ error: 'Link not found' })
  }

  const clicks = getClicks().filter((c) => c.shortCode === req.params.shortCode)
  res.json({ ...link, clickCount: clicks.length, clicks })
})

// Get clicks for a link
router.get('/api/clicks/:shortCode', (req, res) => {
  const clicks = getClicks().filter((c) => c.shortCode === req.params.shortCode)
  res.json(clicks)
})

// Redirect handler — logs click then redirects
router.get('/r/:shortCode', (req, res) => {
  const links = getLinks()
  const link = links.find((l) => l.shortCode === req.params.shortCode)

  if (!link) {
    return res.status(404).send('Link not found')
  }

  saveClick({
    shortCode: link.shortCode,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
    referer: req.get('referer') || '',
  })

  res.redirect(302, link.fullUrl)
})

module.exports = router
