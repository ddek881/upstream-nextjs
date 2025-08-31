'use client'

import { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'

export default function HLSDebugTest() {
  const [status, setStatus] = useState('Ready')
  const [logs, setLogs] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testTRCellHLS = () => {
    addLog('=== Testing TR Cell HLS ===')
    setStatus('Testing TR Cell HLS...')
    setIsPlaying(false)
    
    if (!videoRef.current) {
      addLog('ERROR: Video element not found')
      return
    }

    const video = videoRef.current
    const streamUrl = 'https://stream.trcell.id/hls/byon2.m3u8'
    
    addLog(`Stream URL: ${streamUrl}`)
    addLog(`HLS.js Supported: ${Hls.isSupported()}`)
    
    // Clean up previous instance
    if (hlsRef.current) {
      addLog('Destroying previous HLS instance')
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    // Reset video
    video.src = ''
    
    if (Hls.isSupported()) {
      addLog('Creating new HLS instance...')
      
      try {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          debug: true
        })
        
        addLog('HLS instance created successfully')
        
        // Add event listeners
        hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
          addLog('✅ Media attached to HLS')
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_LOADING, () => {
          addLog('📡 Loading manifest...')
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
          addLog(`✅ Manifest loaded: ${data.levels.length} quality levels`)
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          addLog('✅ Manifest parsed, ready to play')
          setStatus('Manifest parsed, playing...')
          
          video.play().then(() => {
            addLog('✅ Video started playing')
            setIsPlaying(true)
            setStatus('Playing TR Cell Stream')
          }).catch(error => {
            addLog(`❌ Video play failed: ${error.message}`)
            setStatus('Play failed')
          })
        })
        
        hlsRef.current.on(Hls.Events.LEVEL_LOADING, (event, data) => {
          addLog(`📡 Loading level ${data.level}`)
        })
        
        hlsRef.current.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          addLog(`✅ Level ${data.level} loaded`)
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          addLog(`❌ HLS Error: ${data.type} - ${data.details}`)
          setStatus('HLS Error')
        })
        
        // Load source
        addLog('Loading source...')
        hlsRef.current.loadSource(streamUrl)
        hlsRef.current.attachMedia(video)
        
      } catch (error) {
        addLog(`❌ HLS creation failed: ${error}`)
        setStatus('HLS creation failed')
      }
      
    } else {
      addLog('❌ HLS.js not supported')
      setStatus('HLS.js not supported')
    }
  }

  const testMuxHLS = () => {
    addLog('=== Testing Mux HLS ===')
    setStatus('Testing Mux HLS...')
    setIsPlaying(false)
    
    if (!videoRef.current) {
      addLog('ERROR: Video element not found')
      return
    }

    const video = videoRef.current
    const streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    
    addLog(`Stream URL: ${streamUrl}`)
    
    // Clean up previous instance
    if (hlsRef.current) {
      addLog('Destroying previous HLS instance')
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    // Reset video
    video.src = ''
    
    if (Hls.isSupported()) {
      addLog('Creating new HLS instance...')
      
      try {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          debug: true
        })
        
        addLog('HLS instance created successfully')
        
        // Add event listeners
        hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
          addLog('✅ Media attached to HLS')
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_LOADING, () => {
          addLog('📡 Loading manifest...')
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
          addLog(`✅ Manifest loaded: ${data.levels.length} quality levels`)
        })
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          addLog('✅ Manifest parsed, ready to play')
          setStatus('Manifest parsed, playing...')
          
          video.play().then(() => {
            addLog('✅ Video started playing')
            setIsPlaying(true)
            setStatus('Playing Mux Stream')
          }).catch(error => {
            addLog(`❌ Video play failed: ${error.message}`)
            setStatus('Play failed')
          })
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          addLog(`❌ HLS Error: ${data.type} - ${data.details}`)
          setStatus('HLS Error')
        })
        
        // Load source
        addLog('Loading source...')
        hlsRef.current.loadSource(streamUrl)
        hlsRef.current.attachMedia(video)
        
      } catch (error) {
        addLog(`❌ HLS creation failed: ${error}`)
        setStatus('HLS creation failed')
      }
      
    } else {
      addLog('❌ HLS.js not supported')
      setStatus('HLS.js not supported')
    }
  }

  const stopVideo = () => {
    addLog('=== Stopping Video ===')
    setStatus('Stopping...')
    setIsPlaying(false)
    
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
    
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    setStatus('Stopped')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-lg">
      <h3 className="text-lg font-bold mb-4">HLS Debug Test</h3>
      
      <div className="mb-4">
        <div className="text-sm font-semibold mb-2">Status: {status}</div>
        <div className="text-sm mb-2">Playing: {isPlaying ? '✅ Yes' : '❌ No'}</div>
        
        <video
          ref={videoRef}
          className="w-full h-32 bg-black rounded"
          controls
          muted
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testTRCellHLS}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Test TR Cell HLS
        </button>
        
        <button
          onClick={testMuxHLS}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
        >
          Test Mux HLS
        </button>
        
        <button
          onClick={stopVideo}
          className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
        >
          Stop Video
        </button>
        
        <button
          onClick={clearLogs}
          className="w-full bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="max-h-40 overflow-y-auto bg-gray-100 p-2 rounded text-xs">
        <div className="font-semibold mb-2">Logs:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
