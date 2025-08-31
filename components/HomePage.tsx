'use client'

import { useState, useEffect } from 'react'
import { Stream } from '@/lib/database'
import StreamCard from './StreamCard'
import { useUserID } from './UserIDProvider'

export default function HomePage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userId, isLoading: userIdLoading } = useUserID()

  useEffect(() => {
    fetchStreams()
  }, [])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/streams')
      
      if (response.ok) {
        const data = await response.json()
        setStreams(data)
      } else {
        setError('Gagal memuat data stream')
      }
    } catch (error) {
      console.error('Error fetching streams:', error)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while userId is being initialized
  if (userIdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Menyiapkan aplikasi...</p>
          {userId && (
            <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat stream...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchStreams}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 lg:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Selamat Datang di
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                UpStream
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Platform streaming langsung terbaik dengan kualitas HD dan konten eksklusif
            </p>
            
            {/* User ID Display */}
            {userId && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 mb-8 inline-block border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">User ID Anda:</p>
                <p className="font-mono text-blue-400 text-xs break-all">{userId}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Streams Section */}
      <section className="px-4 lg:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Stream Tersedia</h2>
            <p className="text-gray-400">Pilih stream favorit Anda</p>
          </div>

          {streams.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-semibold text-white mb-2">Tidak Ada Stream</h3>
              <p className="text-gray-400">Belum ada stream yang tersedia saat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
