'use client'

import { useState, useEffect } from 'react'
import { Stream } from '@/lib/database'
import { getStreams } from '@/data/streams'
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut } from 'lucide-react'
import StreamForm from './components/StreamForm'
import AdminLogin from '@/components/AdminLogin'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { truncateHtml } from '@/utils/textUtils'

interface PaymentStats {
  [streamId: string]: {
    pending: number
    paid: number
    totalAmount: number
  }
}

export default function AdminPage() {
  const { isAuthenticated, user, loading: authLoading, logout } = useAdminAuth()
  const [streams, setStreams] = useState<Stream[]>([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStream, setEditingStream] = useState<Stream | null>(null)

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const [streamsData, paymentStatsData] = await Promise.all([
        // Get ALL streams for admin (including hidden ones)
        fetch('/api/admin/streams?includeHidden=true').then(res => res.ok ? res.json() : []),
        fetch('/api/admin/payment-stats').then(res => res.ok ? res.json() : {})
      ])
      setStreams(streamsData)
      setPaymentStats(paymentStatsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreams()
  }, [])

  // Derived filtered & paginated data (client-side)
  const normalizedQuery = q.trim().toLowerCase()
  const filteredStreams = normalizedQuery
    ? streams.filter((s) => {
        const title = (s.title || '').toLowerCase()
        const description = (s.description || '').toLowerCase()
        const category = (s.category || '').toLowerCase()
        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          category.includes(normalizedQuery)
        )
      })
    : streams
  const totalFiltered = filteredStreams.length
  const totalPages = Math.max(Math.ceil(totalFiltered / limit), 1)
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const startIdx = (safePage - 1) * limit
  const endIdx = startIdx + limit
  const paginatedStreams = filteredStreams.slice(startIdx, endIdx)

  const handleSaveStream = async (streamData: Partial<Stream>) => {
    try {
      console.log('Saving stream data:', streamData)
      
      const url = '/api/admin/streams'
      const method = editingStream ? 'PUT' : 'POST'
      const body = editingStream ? { ...streamData, id: editingStream.id } : streamData
      
      console.log('Request:', { method, url, body })
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error('Invalid response from server')
      }
      
      console.log('Response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      // Show success message
      alert(responseData.message || 'Stream berhasil disimpan')
      
      // Refresh streams list
      await fetchStreams()
      
      // Close form
      setShowForm(false)
      setEditingStream(null)
      
    } catch (error) {
      console.error('Error saving stream:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream)
    setShowForm(true)
  }

  const handleAddStream = () => {
    setEditingStream(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStream(null)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memeriksa akses...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Kelola streams dan konten aplikasi</p>
            {user && (
              <p className="text-xs text-slate-400 mt-1">Selamat datang, {user.username}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-slate-600/50"
          >
            <LogOut size={16} />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {streams.length}
            </div>
            <div className="text-slate-300">Total Streams</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {streams.filter(s => s.is_live).length}
            </div>
            <div className="text-slate-300">Live Now</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {streams.filter(s => s.is_paid).length}
            </div>
            <div className="text-slate-300">Premium</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {streams.filter(s => s.is_visible).length}
            </div>
            <div className="text-slate-300">Visible</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value) }}
              placeholder="Cari judul/kategori/desk..."
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 w-64"
            />
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value, 10)) }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value={10}>10 / halaman</option>
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
          </div>
          <button 
            onClick={handleAddStream}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Tambah Stream Baru
          </button>
        </div>

        {/* Streams Table */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Stream
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedStreams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="w-12 h-8 rounded object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {stream.title}
                          </div>
                          <div className="text-sm text-slate-400">
                            {truncateHtml(stream.description, 30)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {/* Live Status */}
                        {Boolean(stream.is_live) ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                            <div className="w-1 h-1 bg-white rounded-full mr-1 animate-pulse"></div>
                            LIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            SOON
                          </span>
                        )}
                        
                        {/* Premium Status */}
                        {Boolean(stream.is_paid) && stream.price > 0 && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-500 text-white">
                            PREMIUM
                          </span>
                        )}
                        
                        {/* Visibility Status */}
                        {Boolean(stream.is_visible) ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            VISIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
                            HIDDEN
                          </span>
                        )}
                        
                        {/* Popular Status */}
                        {Boolean(stream.is_popular) && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300 capitalize">
                        {stream.category || 'sports'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {Boolean(stream.is_paid) && stream.price > 0 ? (
                        <span className="text-sm text-white">
                          Rp {stream.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-green-400">Gratis</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        {Boolean(stream.is_paid) && stream.price > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            {paymentStats[stream.id]?.pending || 0}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        {Boolean(stream.is_paid) && stream.price > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            {paymentStats[stream.id]?.paid || 0}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        {Boolean(stream.is_paid) && stream.price > 0 ? (
                          <span className="text-sm font-medium text-emerald-400">
                            Rp {(paymentStats[stream.id]?.totalAmount || 0).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditStream(stream)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-300">
            Menampilkan {paginatedStreams.length} dari {totalFiltered} data
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-700/50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-400">Hal {safePage} / {totalPages}</span>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-700/50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Database Info */}
        <div className="mt-8 bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Database Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Database:</span>
              <span className="text-white ml-2">PostgreSQL (Local)</span>
            </div>
            <div>
              <span className="text-slate-400">Connection:</span>
              <span className="text-green-400 ml-2">Connected</span>
            </div>
            <div>
              <span className="text-slate-400">Total Records:</span>
              <span className="text-white ml-2">{streams.length} streams</span>
            </div>
            <div>
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-white ml-2">{new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Stream Form Modal */}
        <StreamForm
          stream={editingStream}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSave={handleSaveStream}
        />
      </div>
    </div>
  )
}
