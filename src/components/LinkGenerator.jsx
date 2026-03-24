import { useState, useMemo, useRef, useEffect } from 'react'

const UTM_FIELDS = [
  {
    key: 'utm_source',
    label: 'Source',
    placeholder: 'Type or select a source...',
    suggestions: ['google', 'facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'reddit', 'newsletter', 'bing', 'pinterest', 'email'],
  },
  {
    key: 'utm_medium',
    label: 'Medium',
    placeholder: 'Type or select a medium...',
    suggestions: ['cpc', 'cpm', 'social', 'email', 'organic', 'referral', 'display', 'affiliate', 'video', 'podcast', 'banner', 'push'],
  },
  {
    key: 'utm_campaign',
    label: 'Campaign',
    placeholder: 'Type or select a campaign...',
    suggestions: ['spring_sale_2026', 'product_launch', 'brand_awareness', 'retargeting', 'black_friday', 'newsletter_weekly', 'webinar_promo', 'free_trial'],
  },
  {
    key: 'utm_term',
    label: 'Term',
    placeholder: 'Type or select a term...',
    suggestions: ['branded', 'non_branded', 'competitor', 'long_tail', 'exact_match', 'broad_match'],
  },
  {
    key: 'utm_content',
    label: 'Content',
    placeholder: 'Type or select content...',
    suggestions: ['header_link', 'footer_link', 'sidebar_cta', 'blue_cta', 'hero_banner', 'text_link', 'image_ad', 'video_ad', 'carousel', 'popup'],
  },
]

function ComboboxInput({ value, onChange, suggestions, placeholder }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes((filter || value).toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setFilter('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e) {
    const val = e.target.value
    onChange(val)
    setFilter(val)
    setOpen(true)
  }

  function handleSelect(suggestion) {
    onChange(suggestion)
    setFilter('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => { setOpen(!open); inputRef.current?.focus() }}
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600"
        >
          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onClick={() => handleSelect(s)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 ${
                value === s ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function LinkGenerator({ onLinkCreated }) {
  const [baseUrl, setBaseUrl] = useState('')
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  })
  const [customParams, setCustomParams] = useState([])
  const [shortUrl, setShortUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => {
    if (!baseUrl) return ''
    try {
      const url = new URL(baseUrl)
      Object.entries(utmParams).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v)
      })
      customParams.forEach(({ key, value }) => {
        if (key && value) url.searchParams.set(key, value)
      })
      return url.toString()
    } catch {
      return ''
    }
  }, [baseUrl, utmParams, customParams])

  function handleUtmChange(key, value) {
    setUtmParams((prev) => ({ ...prev, [key]: value }))
  }

  function addCustomParam() {
    setCustomParams((prev) => [...prev, { key: '', value: '' }])
  }

  function updateCustomParam(index, field, value) {
    setCustomParams((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  function removeCustomParam(index) {
    setCustomParams((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setShortUrl('')

    if (!baseUrl) {
      setError('Please enter a base URL')
      return
    }

    try {
      new URL(baseUrl)
    } catch {
      setError('Please enter a valid URL (include https://)')
      return
    }

    const allParams = { ...utmParams }
    customParams.forEach(({ key, value }) => {
      if (key && value) allParams[key] = value
    })

    setLoading(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, params: allParams }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const short = `${window.location.origin}/r/${data.shortCode}`
      setShortUrl(short)
      onLinkCreated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setBaseUrl('')
    setUtmParams({ utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' })
    setCustomParams([])
    setShortUrl('')
    setError('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Base URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* UTM Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UTM_FIELDS.map(({ key, label, placeholder, suggestions }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <ComboboxInput
                value={utmParams[key]}
                onChange={(val) => handleUtmChange(key, val)}
                suggestions={suggestions}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Custom Params */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Custom Parameters</label>
            <button
              type="button"
              onClick={addCustomParam}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add parameter
            </button>
          </div>
          {customParams.map((param, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={param.key}
                onChange={(e) => updateCustomParam(i, 'key', e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => updateCustomParam(i, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeCustomParam(i)}
                className="px-3 py-2 text-red-500 hover:text-red-700 font-medium"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase">Preview URL</span>
              <button
                type="button"
                onClick={() => handleCopy(previewUrl)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Copy full URL
              </button>
            </div>
            <p className="text-sm text-slate-700 break-all font-mono">{previewUrl}</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Short Link'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-slate-600 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Result */}
      {shortUrl && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800 mb-2">Short link generated!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-green-200 text-green-900 break-all">
              {shortUrl}
            </code>
            <button
              onClick={() => handleCopy(shortUrl)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
