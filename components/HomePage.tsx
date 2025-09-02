'use client'

import { useState, useEffect, useMemo } from 'react'
import { Stream, Category } from '@/lib/database'
import StreamCard from './StreamCard'
import { useUserID } from './UserIDProvider'
import { ChevronDown } from 'lucide-react'

export default function HomePage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('semua')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { userId, isLoading: userIdLoading } = useUserID()

  useEffect(() => {
    fetchStreams()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.filter-dropdown')) {
        setIsFilterOpen(false)
      }
    }

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterOpen])

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

  // Helper function to normalize category names for matching
  const normalizeCategoryName = (name: string) => {
    return name.toLowerCase().replace(/[-\s]+/g, '-').trim()
  }

  // Get unique category names from streams
  const categoryNames = useMemo(() => {
    const uniqueCategories = [...new Set(streams.map(stream => stream.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [streams])

  // Helper function to find category data by stream category name
  const findCategoryData = (streamCategoryName: string) => {
    if (!streamCategoryName) return null
    
    // Try exact match first
    let categoryData = categories.find(cat => cat.name === streamCategoryName)
    
    if (!categoryData) {
      // Try normalized matching
      const normalizedStreamName = normalizeCategoryName(streamCategoryName)
      categoryData = categories.find(cat => {
        const normalizedCatName = normalizeCategoryName(cat.name)
        return normalizedCatName === normalizedStreamName
      })
    }
    
    return categoryData
  }

  // Filter streams based on selected filter
  const filteredStreams = useMemo(() => {
    if (selectedFilter === 'semua') {
      return streams
    } else if (selectedFilter === 'hot') {
      return streams.filter(stream => Boolean(stream.is_popular))
    } else {
      return streams.filter(stream => stream.category === selectedFilter)
    }
  }, [streams, selectedFilter])

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
      <section className="relative py-8 px-4 lg:px-6 overflow-hidden">
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
            
            {/* Iklan Banner */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-xl p-3 mb-3 border border-blue-500/30 shadow-lg">
              <div className="text-center">
                <div className="text-4xl mb-3">📢</div>
                <h3 className="text-xl font-bold text-white mb-2">Space Iklan</h3>
                <p className="text-gray-300 mb-4">Jika minat hubungi tim business</p>
                <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/50">
                  <p className="text-blue-400 font-semibold">Telegram: @business_upstream</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streams Section */}
      <section className="px-4 lg:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center pt-4 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Stream Tersedia</h2>
            <p className="text-gray-400 mb-6">Pilih stream favorit Anda</p>
            
            {/* Filter Dropdown */}
            <div className="flex justify-center">
              <div className="relative filter-dropdown">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-between gap-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg px-6 py-3 text-white hover:bg-gray-700/50 transition-colors min-w-[300px] shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Filter:</span>
                    <div className="flex items-center gap-2">
                      {selectedFilter === 'semua' ? (
                        <>
                          <span className="text-lg">📺</span>
                          <span className="capitalize font-medium">Semua Stream</span>
                        </>
                      ) : selectedFilter === 'hot' ? (
                        <>
                          <span className="text-lg">🔥</span>
                          <span className="capitalize font-medium">Hot</span>
                        </>
                      ) : (
                        <>
                          {(() => {
                            const categoryData = findCategoryData(selectedFilter)
                            return (
                              <>
                                {categoryData?.img_url ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600/50 flex-shrink-0">
                                    <img
                                      src={categoryData.img_url}
                                      alt={categoryData.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-lg">🎬</span>
                                )}
                                <span className="capitalize font-medium">
                                  {(categoryData?.name || selectedFilter).replace(/-/g, ' ').toUpperCase()}
                                </span>
                              </>
                            )
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto min-w-[300px]">
                    {/* Semua */}
                    <button
                      onClick={() => {
                        setSelectedFilter('semua')
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors ${
                        selectedFilter === 'semua' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
                      }`}
                    >
                      📺 Semua Stream
                    </button>
                    
                    {/* Hot */}
                    <button
                      onClick={() => {
                        setSelectedFilter('hot')
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors ${
                        selectedFilter === 'hot' ? 'bg-blue-600/20 text-blue-400' : 'text-white'
                      }`}
                    >
                      🔥 Stream Populer
                    </button>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-700/50 my-1"></div>
                    
                    {/* Categories */}
                    {categoryNames.map((categoryName) => {
                      const categoryData = findCategoryData(categoryName || '')
                      return (
                        <button
                          key={categoryName}
                          onClick={() => {
                            setSelectedFilter(categoryName || 'semua')
                            setIsFilterOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors capitalize ${
                            selectedFilter === categoryName ? 'bg-blue-600/20 text-blue-400' : 'text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {categoryData?.img_url ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600/50 flex-shrink-0">
                                <img
                                  src={categoryData.img_url}
                                  alt={categoryData.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <span className="text-lg">🎬</span>
                            )}
                            <span>{(categoryData?.name || categoryName || '').replace(/-/g, ' ').toUpperCase()}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stream Count Info */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm">
              Menampilkan {filteredStreams.length} dari {streams.length} stream
              {selectedFilter !== 'semua' && (
                <span className="text-blue-400">
                  {' '}(Filter: {selectedFilter === 'hot' ? '🔥 Hot' : (() => {
                    const categoryData = findCategoryData(selectedFilter)
                    return categoryData?.img_url ? (
                      <span className="inline-flex items-center gap-1">
                        <img
                          src={categoryData.img_url}
                          alt={categoryData.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        {(categoryData?.name || selectedFilter).replace(/-/g, ' ').toUpperCase()}
                      </span>
                    ) : (
                      selectedFilter.replace(/-/g, ' ').toUpperCase()
                    )
                  })()})
                </span>
              )}
            </p>
          </div>

          {filteredStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedFilter === 'semua' ? 'Tidak Ada Stream' : 
                 selectedFilter === 'hot' ? 'Tidak Ada Stream Hot' : 
                 `Tidak Ada Stream Kategori ${(() => {
                   const categoryData = findCategoryData(selectedFilter)
                   return (categoryData?.name || selectedFilter).replace(/-/g, ' ').toUpperCase()
                 })()}`}
              </h3>
              <p className="text-gray-400">
                {selectedFilter === 'semua' ? 'Belum ada stream yang tersedia saat ini' :
                 selectedFilter === 'hot' ? 'Belum ada stream populer saat ini' :
                 `Belum ada stream dalam kategori ${(() => {
                   const categoryData = findCategoryData(selectedFilter)
                   return (categoryData?.name || selectedFilter).replace(/-/g, ' ').toUpperCase()
                 })()} saat ini`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
