import { useState, useEffect } from 'react'

export default function ClickDetails({ shortCode }) {
  const [clicks, setClicks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clicks/${shortCode}`)
      .then((res) => res.json())
      .then(setClicks)
      .finally(() => setLoading(false))
  }, [shortCode])

  if (loading) return <p className="text-sm text-slate-500 py-2 px-4">Loading clicks...</p>
  if (clicks.length === 0) return <p className="text-sm text-slate-500 py-2 px-4">No clicks yet</p>

  function maskIp(ip) {
    if (!ip) return '—'
    const parts = ip.replace('::ffff:', '').split('.')
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.**`
    return ip.slice(0, Math.ceil(ip.length / 2)) + '***'
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString()
  }

  function truncate(str, len = 60) {
    if (!str) return '—'
    return str.length > len ? str.slice(0, len) + '...' : str
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200">
      <div className="px-4 py-2 bg-slate-100">
        <span className="text-xs font-semibold text-slate-600 uppercase">
          {clicks.length} click{clicks.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="px-4 py-2 font-medium">Timestamp</th>
              <th className="px-4 py-2 font-medium">IP</th>
              <th className="px-4 py-2 font-medium">User Agent</th>
              <th className="px-4 py-2 font-medium">Referer</th>
            </tr>
          </thead>
          <tbody>
            {clicks.map((click, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-white">
                <td className="px-4 py-2 whitespace-nowrap text-slate-700">{formatDate(click.timestamp)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-slate-600 font-mono">{maskIp(click.ip)}</td>
                <td className="px-4 py-2 text-slate-600">{truncate(click.userAgent)}</td>
                <td className="px-4 py-2 text-slate-600">{truncate(click.referer) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
