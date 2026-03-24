const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const LINKS_FILE = path.join(DATA_DIR, 'links.json')
const CLICKS_FILE = path.join(DATA_DIR, 'clicks.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(LINKS_FILE)) {
    fs.writeFileSync(LINKS_FILE, '[]')
  }
  if (!fs.existsSync(CLICKS_FILE)) {
    fs.writeFileSync(CLICKS_FILE, '[]')
  }
}

function readJSON(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
}

function getLinks() {
  return readJSON(LINKS_FILE)
}

function saveLink(link) {
  const links = getLinks()
  links.push(link)
  writeJSON(LINKS_FILE, links)
  return link
}

function getClicks() {
  return readJSON(CLICKS_FILE)
}

function saveClick(click) {
  const clicks = getClicks()
  clicks.push(click)
  writeJSON(CLICKS_FILE, clicks)
}

module.exports = {
  ensureDataDir,
  getLinks,
  saveLink,
  getClicks,
  saveClick,
  LINKS_FILE,
  CLICKS_FILE,
}
