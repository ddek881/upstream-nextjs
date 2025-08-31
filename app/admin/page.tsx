'use client'

import { useState, useEffect } from 'react'
import { Stream } from '@/lib/database'
import { getStreams } from '@/data/streams'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function AdminPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true)
        const data = await getStreams()
        setStreams(data)
      } catch (error) {
        console.error('Error fetching streams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreams()
  }, [])

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">Kelola streams dan konten aplikasi</p>
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
        <div className="mb-6">
          <button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {streams.map((stream) => (
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
                            {stream.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {stream.is_live && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                            <div className="w-1 h-1 bg-white rounded-full mr-1 animate-pulse"></div>
                            LIVE
                          </span>
                        )}
                        {stream.is_paid && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-500 text-white">
                            PREMIUM
                          </span>
                        )}
                        {stream.is_visible ? (
                          <Eye size={16} className="text-green-400" />
                        ) : (
                          <EyeOff size={16} className="text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {stream.is_paid ? (
                        <span className="text-sm text-white">
                          Rp {stream.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-green-400">Gratis</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
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
      </div>
    </div>
  )
}
