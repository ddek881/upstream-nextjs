'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stream } from '@/lib/database'
import { ArrowLeft, Users, Clock, DollarSign, Crown, AlertCircle, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useUserID } from '@/components/UserIDProvider'
import Hls from 'hls.js'
import { renderHtml } from '@/utils/textUtils'

function StreamPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const streamId = searchParams.get('id')
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [viewerCountLoading, setViewerCountLoading] = useState(false)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  const { userId, isLoading: userIdLoading } = useUserID()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (streamId) {
      const fetchStream = async () => {
        try {
          setLoading(true)
          
          // Use API instead of direct database call
          const response = await fetch(`/api/streams/${streamId}`)
          if (response.ok) {
            const foundStream = await response.json()
            setStream(foundStream)
            
            // Get real viewer count
            await fetchViewerCount(foundStream.id)

            // Add viewer to database
            if (userId) {
              await addViewer(foundStream.id)
            }

            // Check payment access if stream is paid, live, and userId is available
            if (foundStream?.is_paid && foundStream?.is_live && userId) {
              await checkPaymentAccess(foundStream.id)
            }
          } else {
          
            setStream(null)
          }
        } catch (error) {
       
          setStream(null)
        } finally {
          setLoading(false)
        }
      }
      fetchStream()
    }
  }, [streamId, userId])

  // Auto refresh viewer count every 10 seconds
  useEffect(() => {
    if (!stream?.id) return

    const interval = setInterval(() => {
      fetchViewerCount(stream.id)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [stream?.id])

  // Auto refresh chat messages every 5 seconds
  useEffect(() => {
    if (!stream?.id) return

    const interval = setInterval(() => {
      fetchChatMessages(stream.id)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [stream?.id])

  const fetchViewerCount = async (streamId: string) => {
    try {
      setViewerCountLoading(true)
      const response = await fetch(`/api/streams/${streamId}/viewers`)
      if (response.ok) {
        const data = await response.json()
        setViewerCount(data.count)
      }
    } catch (error) {
     
    } finally {
      setViewerCountLoading(false)
    }
  }

  const fetchChatMessages = async (streamId: string) => {
    try {
      // Fetch chat data from API (for future real-time chat implementation)
      const response = await fetch(`/api/streams/${streamId}/chat`)
      if (response.ok) {
        const data = await response.json()
        // For now, we keep the existing random chat generation
        // In the future, this could update chat messages with real data
       
      }
    } catch (error) {
    
    }
  }

  const addViewer = async (streamId: string) => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/streams/${streamId}/viewers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        // Refresh viewer count
        await fetchViewerCount(streamId)
      }
    } catch (error) {
     
    }
  }

  const checkPaymentAccess = async (streamId: string) => {
    if (!userId) return
    
    try {
      setCheckingAccess(true)
      
      const response = await fetch(`/api/check-access?userId=${userId}&streamId=${streamId}`)
      if (response.ok) {
        const data = await response.json()
        setHasPaidAccess(data.data.hasAccess)
        
        // If user doesn't have access, show popup
        if (!data.data.hasAccess) {
          setShowPaymentPopup(true)
        }
      } else {
        // If API fails, assume no access
        setHasPaidAccess(false)
        setShowPaymentPopup(true)
      }
    } catch (error) {
    
      setHasPaidAccess(false)
      setShowPaymentPopup(true)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleVideoError = () => {
    setVideoError(true)
    setVideoLoading(false)
    setVideoReady(false)
    setShowErrorPopup(true)
    
    // Auto hide error popup after 8 seconds
    setTimeout(() => {
      setShowErrorPopup(false)
    }, 8000)
  }

  const startVideo = () => {
    if (!videoRef.current || !stream) return
    
    
    
    setVideoError(false)
    setVideoLoading(true)
    setVideoReady(false)
    setShowErrorPopup(false)
    
    const video = videoRef.current
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    if (Hls.isSupported()) {
      try {
        // Create new HLS instance with more tolerant settings
        hlsRef.current = new Hls({ 
          debug: false,
          enableWorker: false,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10
        })
        
        // Attach media first
        hlsRef.current.attachMedia(video)
        
        // Load source
        hlsRef.current.loadSource(stream.url)
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
         
          setVideoLoading(false)
          setVideoReady(true)
          setShowPlayButton(true)
          // Try to auto-play, if fails show manual play button
          video.play().then(() => {
           
            setVideoPlaying(true)
            setShowPlayButton(false)
          }).catch(error => {
          
            setShowPlayButton(true)
          })
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
         
          if (data.fatal) {
           
          }
        })
        
      } catch (error) {
       
       
      }
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
     
      video.src = stream.url
      setVideoLoading(false)
      setVideoReady(true)
      setShowPlayButton(true)
      // Try to auto-play, if fails show manual play button
      video.play().then(() => {
      
        setVideoPlaying(true)
        setShowPlayButton(false)
      }).catch(error => {
       
        setShowPlayButton(true)
      })
    } else {
    
      handleVideoError()
    }
  }

  const handlePaymentRedirect = () => {
    if (stream) {
      router.push(`/payment?streamId=${stream.id}`)
    }
  }

  const handleHomeRedirect = () => {
    router.push('/')
  }

  // Generate random UUID-like string (full length, will be truncated later)
  const generateUserId = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return uuid // Return full UUID so it gets truncated with ...
  }

  // Truncate username to 13 characters
  const truncateUsername = (username: string) => {
    if (!username) return 'Anonymous'
    return username.length > 13 ? username.substring(0, 10) + '...' : username
  }

  // Cek database dulu, kalau ada chat_live gunakan itu, kalau kosong baru random template
  const templates = (() => {
    if (stream?.chat_live && typeof stream.chat_live === 'string' && stream.chat_live.trim().length > 0) {
      // Split by comma, trim, dan filter kosong
      return stream.chat_live.split(',').map(msg => msg.trim()).filter(msg => msg.length > 0);
    }
    // Kalau database kosong, gunakan random template
    return [
      "Anjay gak nyesel nonton di UpStream 🔥",
      "Gaskeun ngab, UpStream emang juara! 💯",
      "Bestieee sini nonton bareng di UpStream 😍",
      "Sumpah betah banget nongkrong di UpStream",
      "UpStream bikin malem jadi rame terus ✨",
      "Ngab, kualitasnya mantap abis, no debat!",
      "Gas terus bang, kontennya bikin nagih 👍",
      "UpStream udah kayak tongkrongan online 🎉",
      "Wajib banget tiap live di UpStream 🚀",
      "Bestie gak ada lag sama sekali, smooth parah ⚡",
      "Wihh, nonton di UpStream berasa premium 👌",
      "Puas pol nonton disini ❤️",
      "Streamer humble banget, bikin nyaman 💬",
      "Gak salah pilih, UpStream emang beda!",
      "UpStream selalu bikin vibes positif 🌟",
      "Anjir rame bener chatnya wkwk 😂",
      "Kualitas suara cling abis di UpStream 🎵",
      "Mantul banget pokoknya di UpStream 🤟",
      "Gaspol ngab, viewer makin rame tiap hari 🙌",
      "Pokoknya fix jadi langganan nonton di sini 👑",
      // Tambahan baru
      "Nonton di UpStream bikin lupa waktu! ⏰",
      "UpStream, tempat nongkrong online paling asik!",
      "Chat di sini seru banget, bestie pada aktif semua 😆",
      "Streamer di UpStream selalu interaktif banget 👏",
      "UpStream, solusi anti gabut malam minggu 😎",
      "Gak pernah bosen nonton live di UpStream!",
      "UpStream, tempatnya konten kreatif Indonesia 🇮🇩",
      "Setiap live di UpStream pasti rame dan seru 🔥",
      "UpStream, bikin hari-hari makin berwarna 🌈",
      "Nonton bareng di UpStream, vibesnya dapet banget!",
      "UpStream, tempat cari hiburan tanpa drama 😁",
      "Streamer di sini selalu ramah dan lucu-lucu 🤣",
      "UpStream, pilihan utama buat live streaming!",
      "Pokoknya UpStream no kaleng-kaleng! 🥇",
      "Nonton di UpStream, chatnya selalu hidup!",
      "UpStream, tempatnya para bestie ngumpul 👯‍♂️",
      "Setiap malam pasti mampir ke UpStream dulu!",
      "UpStream, bikin suasana makin hangat 🔥",
      "Streamer favoritku cuma ada di UpStream!",
      "UpStream, tempat healing online paling mantap 😌",
    ];
  })();

  const cities = [
    "Jakarta hadir 👋",
    "Surabaya support 🙌",
    "Bandung mantau 🎉",
    "Medan masuk 💪",
    "Jogja ramein 🔥",
    "Bali ikut nonton 🌴",
    "Makassar hadir 🌊",
    "Palembang support ⚡",
    "Malang mantau 🏔️",
    "Samarinda nongol ✨",
  ];

  const userEmotes = [
    '🔥', '👏', '❤️', '😍', '🎉', '💯', '⚡', '🚀', '👍', '🎵', '🌟', '💪',
    '😂', '😊', '😎', '🥳', '🤩', '😱', '🤯', '🙌', '👌', '✨', '💖', '🎊',
    '🎈', '🎁', '🏆', '🥇', '🎯', '🎪', '🎭', '🎨', '🎬', '📺', '🎮', '🎸',
    '🎤', '🎧', '🎹', '🥁', '🎺', '🎻', '🎲', '🃏', '🎰', '🎳'
  ];
  


  function generateMessages(count = 1000) {
    const messages = [];
    for (let i = 0; i < count; i++) {
      // Ambil template random
      const base = templates[Math.floor(Math.random() * templates.length)];
      // Kadang ditambah kota biar variasi
      if (Math.random() > 0.7) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        messages.push(`${base} - ${city}`);
      } else {
        messages.push(base);
      }
    }
    return messages;
  }

  // Question templates for non-live streams
  // Cek database dulu, kalau ada chat_nolive gunakan itu, kalau kosong baru random template
  const questionTemplates = (() => {
    if (stream?.chat_nolive && typeof stream.chat_nolive === 'string' && stream.chat_nolive.trim().length > 0) {
      // Split by comma, trim, dan filter kosong
      return stream.chat_nolive.split(',').map(msg => msg.trim()).filter(msg => msg.length > 0);
    }
    // Kalau database kosong, gunakan random template
    return [
      "Kapan nih live streamnya? 🤔",
      "Jam berapa mulainya ya? ⏰",
      "Udah gak sabar nunggu live! 😍",
      "Konten apa yang bakal dibawain nanti? 🎬",
      "Siapa aja yang udah nunggu dari tadi? 🙋‍♂️",
      "Bakal ada games gak ya nanti? 🎮",
      "Durasi streamnya berapa lama kira-kira? ⏱️",
      "Ada special guest gak nih? 👥",
      "Tema stream kali ini apa ya? 📝",
      "Udah siap-siap camilan buat nonton! 🍿",
      "Siapa yang udah bookmark jadwalnya? 📅",
      "Bakal ada giveaway gak ya? 🎁",
      "Stream perdana nih di UpStream! 🎉",
      "Penasaran sama kualitas streamingnya 📺",
      "Udah follow belum biar gak ketinggalan? ➕",
      "Siapa yang nunggu dari kemarin? 😂",
      "Bakal seru nih kayaknya! 🔥",
      "Ada yang tau topik bahasannya? 💭",
      "Countdown dimulai! ⏳",
      "Semoga lancar streamingnya nanti 🙏",
      "Udah prepare pertanyaan buat nanti 🗣️",
      "Siapa yang first time di UpStream? 👋",
      "Bakal ada Q&A session gak ya? ❓",
      "Excited banget nunggu mulai! 🚀",
      "Kira-kira bakal rame gak ya chatnya? 💬",
      "Udah set reminder belum? 🔔",
      "Pengen tau behind the scene nya 🎭",
      "Bakal ada demo atau tutorial gak? 📚",
      "Siapa yang udah share ke temen-temen? 📤",
      "Stream premium worth it gak sih? 💰"
    ];
  })();

  const questionCities = [
    "Ada yang dari Jakarta? 🏙️",
    "Surabaya hadir gak? 🌊",
    "Bandung squad dimana? 🏔️",
    "Medan viewers ready? 🌴",
    "Jogja students siap? 🎓",
    "Bali watchers online? 🏖️",
    "Makassar team standby? ⛵",
    "Palembang fans ready? 🛶",
    "Malang people here? 🍎",
    "Samarinda viewers aktif? 🌿"
  ];

  function generateQuestions(count = 500) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      const base = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      // 30% chance to add city question
      if (Math.random() > 0.7) {
        const city = questionCities[Math.floor(Math.random() * questionCities.length)];
        questions.push(city);
      } else {
        questions.push(base);
      }
    }
    return questions;
  }

  const userMessages = generateMessages(100);
  const userQuestions = generateQuestions(50);

  // Initialize empty chat and random messages
  useEffect(() => {
    // Start with empty chat
    setChatMessages([])

    // Simulate random user messages with emotes, stickers, and text
    const userInterval = setInterval(() => {
      // Choose content based on stream status
      const rand = Math.random()
      let content
      
      if (stream?.is_live) {
        // Live stream: use database chat_live or fallback to default messages
        const dbChatLive = stream?.chat_live ? stream.chat_live.split(',').map(msg => msg.trim()).filter(msg => msg) : []
        const liveMessages = dbChatLive.length > 0 ? dbChatLive : userMessages
        
        if (rand < 0.8) {
          content = liveMessages[Math.floor(Math.random() * liveMessages.length)]
        } else {
          content = userEmotes[Math.floor(Math.random() * userEmotes.length)]
        }
      } else {
        // Non-live stream: use database chat_nolive or fallback to default questions
        const dbChatNoLive = stream?.chat_nolive ? stream.chat_nolive.split(',').map(msg => msg.trim()).filter(msg => msg) : []
        const noLiveMessages = dbChatNoLive.length > 0 ? dbChatNoLive : userQuestions
        
        if (rand < 0.8) {
          content = noLiveMessages[Math.floor(Math.random() * noLiveMessages.length)]
        } else {
          content = userEmotes[Math.floor(Math.random() * userEmotes.length)]
        }
      }
      
      const randomUser = generateUserId()
      
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          user: randomUser,
          message: content,
          timestamp: new Date()
        }
      ])
    }, Math.random() * 12000 + 3000) // Random interval between 3-15 seconds

    return () => {
      clearInterval(userInterval)
    }
  }, [stream])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    // Debug: check userId length
    
    const message = {
      id: Date.now().toString(),
      user: userId ? truncateUsername(userId) : truncateUsername(generateUserId()),
      message: newMessage.trim(),
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [chatMessages])

  // Countdown timer for scheduled streams (Indonesian timezone)
  useEffect(() => {
    if (!stream?.scheduled_time || Boolean(stream.is_live)) return

    const updateCountdown = () => {
      const scheduledMs = adjustedIndonesiaEpochMs(stream.scheduled_time!)
      if (scheduledMs === null) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const difference = scheduledMs - Date.now()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [stream?.scheduled_time, stream?.is_live])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Start video when stream is loaded and user has access
  useEffect(() => {
    if (stream && Boolean(stream.is_live)) {
      // For free streams, start immediately
      if (!Boolean(stream.is_paid) || stream.price === 0) {
        setTimeout(() => {
          startVideo()
        }, 500)
      }
      // For paid streams, start only if user has access
      else if (Boolean(stream.is_paid) && hasPaidAccess) {
        setTimeout(() => {
          startVideo()
        }, 500)
      }
    }
  }, [stream, hasPaidAccess])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  // Show loading while userId is being initialized
  if (userIdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Menyiapkan stream...</p>
          {userId && (
            <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat stream...</p>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📺</div>
          <h1 className="text-2xl font-bold text-white mb-2">Stream tidak ditemukan</h1>
          <p className="text-slate-400 mb-6">Stream yang Anda cari tidak tersedia</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatTime = (timeString: string) => {
    const ms = adjustedIndonesiaEpochMs(timeString)
    if (ms === null) return timeString
    const date = new Date(ms)
    const datePart = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date)
    const timePart = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(date).replace(':', '.')
    return `${datePart} pukul ${timePart} WIB`
  }

  // Parse scheduled_time to epoch ms. If string has timezone (ISO Z/offset) use it.
  // Otherwise treat as local wall-clock (no conversion to Indonesia timezone).
  function parseScheduledToMs(input: string): number | null {
    if (!input) return null
    const trimmed = input.trim()
    // ISO with timezone or Z or milliseconds
    if (/\dT\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})$/.test(trimmed)) {
      const ms = Date.parse(trimmed)
      return isNaN(ms) ? null : ms
    }
    // YYYY-MM-DD[ T]HH:MM[:SS]
    let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed)
    if (m) {
      return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || '0')).getTime()
    }
    // dd/MM/yyyy, HH.mm or HH:mm
    m = /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2})[.:](\d{2})$/.exec(trimmed)
    if (m) {
      return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], 0).getTime()
    }
    return null
  }

  // Extract components directly from the input without applying any timezone conversion
  function extractRawComponents(input: string): { year: number; month: number; day: number; hour: number; minute: number; second: number } | null {
    if (!input) return null
    const trimmed = input.trim()
    let m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(trimmed)
    if (m) {
      return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: +m[5], second: +(m[6] || '0') }
    }
    m = /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2})[.:](\d{2})$/.exec(trimmed)
    if (m) {
      return { year: +m[3], month: +m[2], day: +m[1], hour: +m[4], minute: +m[5], second: 0 }
    }
    return null
  }

  // Convert scheduled_time to epoch, then subtract 7 hours before using (per request)
  function adjustedIndonesiaEpochMs(input: string): number | null {
    const base = parseScheduledToMs(input)
    if (base === null) return null
    return base - (7 * 60 * 60 * 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Payment Access Popup */}
      {showPaymentPopup && Boolean(stream.is_paid) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Akses Dibatasi</h2>
              <p className="text-slate-300 text-sm">
                Anda belum melakukan pembayaran untuk stream ini
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handlePaymentRedirect}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Bayar Sekarang
              </button>
              <button
                onClick={handleHomeRedirect}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {/* 2-Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Player */}
          <div className="lg:col-span-2">
            {/* Video/Image Section */}
            <div className="mb-6">
              <div className="bg-black rounded-lg overflow-hidden">
                {Boolean(stream.is_paid) && stream.price > 0 && Boolean(stream.is_live) && !hasPaidAccess ? (
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="w-8 h-8 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Stream Premium</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Anda perlu membayar untuk menonton stream ini
                      </p>
                      <button
                        onClick={handlePaymentRedirect}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Bayar Sekarang
                      </button>
                    </div>
                  </div>
                ) : !Boolean(stream.is_live) ? (
                  // Show image for non-live streams
                  <div className="relative aspect-video">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Center Countdown Timer */}
                    {stream.scheduled_time && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center bg-black/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                          <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
                            Akan Datang
                          </span>
                          
                          {/* Countdown Display */}
                          <div className="mb-4">
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div className="bg-white/10 rounded-lg p-3">
                                <div className="text-2xl font-bold text-white">{countdown.days.toString().padStart(2, '0')}</div>
                                <div className="text-xs text-slate-300">Hari</div>
                              </div>
                              <div className="bg-white/10 rounded-lg p-3">
                                <div className="text-2xl font-bold text-white">{countdown.hours.toString().padStart(2, '0')}</div>
                                <div className="text-xs text-slate-300">Jam</div>
                              </div>
                              <div className="bg-white/10 rounded-lg p-3">
                                <div className="text-2xl font-bold text-white">{countdown.minutes.toString().padStart(2, '0')}</div>
                                <div className="text-xs text-slate-300">Menit</div>
                              </div>
                              <div className="bg-white/10 rounded-lg p-3">
                                <div className="text-2xl font-bold text-white">{countdown.seconds.toString().padStart(2, '0')}</div>
                                <div className="text-xs text-slate-300">Detik</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Scheduled Time */}
                          <div className="flex items-center justify-center gap-2 text-white">
                            <Clock size={16} />
                            <span className="text-sm font-medium">{formatTime(stream.scheduled_time)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Bottom overlay for popular badge */}
                    {Boolean(stream.is_popular) && (
                      <div className="absolute top-0 right-0 p-6">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          🔥 Populer
                        </span>
                      </div>
                    )}
                  </div>
                ) : videoError ? (
                  // Show thumbnail when video error
                  <div className="relative aspect-video">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Error popup overlay */}
                    {showErrorPopup && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white p-6 max-w-md">
                          <div className="text-5xl mb-4">⚠️</div>
                          <h3 className="text-xl font-bold mb-3">Live Streaming Tidak Tersedia</h3>
                          <p className="text-sm text-gray-300 mb-6">
                            Maaf, live streaming sedang mengalami gangguan atau tidak tersedia saat ini.
                          </p>
                          <div className="space-y-3">
                            <button
                              onClick={() => {
                                setShowErrorPopup(false)
                                setVideoError(false)
                                startVideo()
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Coba Lagi
                            </button>
                            <button
                              onClick={() => setShowErrorPopup(false)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Tutup
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show video player
                  <div className="relative aspect-video">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay={Boolean(stream.is_live)}
                      muted={false}
                      controls
                      playsInline
                      poster={stream.thumbnail}
                      onLoadStart={() => {
                        setVideoLoading(true)
                      }}
                      onLoadedData={() => {
                        setVideoLoading(false)
                      }}
                      onCanPlay={() => {
                        setVideoReady(true)
                        setVideoLoading(false)
                      }}
                      onError={(e) => {
                        handleVideoError()
                      }}
                    />
                    
                    {/* Loading indicator */}
                    {videoLoading && !videoReady && !videoError && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="relative mb-3">
                            <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          </div>
                          <p className="text-sm font-medium">Memuat video...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Manual Play Button */}
                    {showPlayButton && videoReady && !videoError && !videoPlaying && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.play().then(() => {
                                setVideoPlaying(true)
                                setShowPlayButton(false)
                              }).catch(error => {
                               
                                handleVideoError()
                              })
                            }
                          }}
                          className="w-20 h-20 bg-orange-500/90 hover:bg-orange-600/90 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-xl"
                        >
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title and Live Badge - Desktop Only */}
            <div className="hidden lg:block mb-6">
              {/* Live Badge - Desktop */}
              {Boolean(stream.is_live) && (
                <div className="flex justify-start mb-3">
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
              )}
              
              {/* Title - Desktop */}
              <h1 className="text-2xl text-capitalize xl:text-3xl font-bold text-white leading-tight">
                {stream.title} - {(stream.category || '').replace(/-/g, ' ').toUpperCase()}
              </h1>
            </div>

            {/* Description - Desktop Only */}
            <div className="hidden lg:block mb-6">
              <div className="relative bg-slate-800/20 rounded-lg p-4">
                <div className="text-slate-200 font-semibold mb-2">
                  Deskripsi
                </div>
                <div 
                  className={`text-slate-200 prose prose-invert prose-slate prose-sm max-w-none leading-relaxed transition-all duration-300 ${
                    showFullDescription ? '' : 'h-16 overflow-hidden'
                  }`}
                  dangerouslySetInnerHTML={renderHtml(stream.description)}
                />
                
                {/* Gradient overlay when collapsed */}
                {!showFullDescription && (
                  <div className="absolute bottom-4 left-4 right-4 h-4 bg-gradient-to-t from-slate-800/20 to-transparent pointer-events-none"></div>
                )}
                
                {/* Toggle button */}
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-3 flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                >
                  {showFullDescription ? (
                    <>
                      <ChevronUp size={16} />
                      Sembunyikan deskripsi
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Tampilkan deskripsi lengkap
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Title and Description - Mobile/Tablet Only */}
            <div className="lg:hidden mb-8">
              {/* Live Badge - Mobile */}
              {Boolean(stream.is_live) && (
                <div className="flex justify-center mb-4">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
              )}
              
              {/* Title - Mobile */}
              <div className="text-center mb-6">
                <h1 className="text-2xl text-capitalize sm:text-3xl font-bold text-white leading-tight">
                  {stream.title} - {(stream.category || '').replace(/-/g, ' ').toUpperCase()}
                </h1>
              </div>

              {/* Description - Mobile */}
              <div className="relative bg-slate-800/20 rounded-lg p-4">
                <div className="text-slate-200 prose prose-invert prose-slate prose-sm max-w-none leading-relaxed transition-all duration-300 mb-2">
                  <span className="font-semibold">Deskripsi</span>
                </div>
                <div 
                  className={`text-slate-200 prose prose-invert prose-slate max-w-none text-base leading-relaxed transition-all duration-300 ${
                    showFullDescription ? '' : 'h-20 overflow-hidden'
                  }`}
                  dangerouslySetInnerHTML={renderHtml(stream.description)}
                />
                
                {/* Gradient overlay when collapsed */}
                {!showFullDescription && (
                  <div className="absolute bottom-4 left-4 right-4 h-4 bg-gradient-to-t from-slate-800/20 to-transparent pointer-events-none"></div>
                )}
                
                {/* Toggle button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp size={16} />
                        Sembunyikan deskripsi
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Tampilkan deskripsi lengkap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Chat Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Chat */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg overflow-hidden h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-slate-700/50 p-4 border-b border-slate-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Live Chat</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      {viewerCountLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        <span>{viewerCount.toLocaleString()} penonton</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  /* Empty Chat Placeholder */
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center text-slate-400">
                      <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium mb-1">Chat sedang kosong</p>
                      <p className="text-xs">Tulis pesan di sini</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {msg.user.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-medium text-white truncate">
                              {truncateUsername(msg.user)}
                            </span>
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              {msg.timestamp.toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span>Seseorang sedang mengetik...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-600/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                    maxLength={200}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Tekan Enter untuk kirim
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StreamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat...</p>
        </div>
      </div>
    }>
      <StreamPageContent />
    </Suspense>
  )
}
