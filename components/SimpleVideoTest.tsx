'use client'

import { useState, useRef } from 'react'

export default function SimpleVideoTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const testVideos = [
    {
      name: 'MP4 Test',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video/mp4'
    },
    {
      name: 'TR Cell HLS',
      url: 'https://stream.trcell.id/hls/byon2.m3u8',
      type: 'application/x-mpegURL'
    },
    {
      name: 'Mux HLS',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      type: 'application/x-mpegURL'
    }
  ]

  const playVideo = (video: typeof testVideos[0]) => {
    console.log('Testing video:', video.name, video.url)
    setError('')
    setIsPlaying(true)
    
    if (videoRef.current) {
      const videoElement = videoRef.current
      
      // Reset video
      videoElement.src = ''
      
      // Set new source
      videoElement.src = video.url
      
      // Try to play
      videoElement.play().then(() => {
        console.log('Video started playing:', video.name)
      }).catch((err) => {
        console.error('Video play failed:', video.name, err)
        setError(`Failed to play ${video.name}: ${err.message}`)
        setIsPlaying(false)
      })
    }
  }

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
    setIsPlaying(false)
    setError('')
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-md">
      <h3 className="text-lg font-bold mb-4">Simple Video Test</h3>
      
      <div className="mb-4">
        <video
          ref={videoRef}
          className="w-full h-32 bg-black rounded"
          controls
          muted
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e)
            setError('Video error occurred')
          }}
        />
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        {testVideos.map((video, index) => (
          <button
            key={index}
            onClick={() => playVideo(video)}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Test {video.name}
          </button>
        ))}
        
        <button
          onClick={stopVideo}
          className="w-full bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
        >
          Stop Video
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Status: {isPlaying ? 'Playing' : 'Stopped'}</p>
        <p>Error: {error ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}
