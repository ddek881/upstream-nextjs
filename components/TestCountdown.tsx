'use client'

import { useState, useEffect, useRef } from 'react'

export default function TestCountdown() {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCountdown = () => {
    console.log('Starting test countdown...')
    setIsActive(true)
    setCountdown(7)
    
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        console.log('Test countdown tick:', prev)
        if (prev !== null && prev <= 1) {
          console.log('Test countdown finished!')
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          setIsActive(false)
          alert('Countdown finished!')
          return 0
        }
        return prev !== null ? prev - 1 : null
      })
    }, 1000)
  }

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
    setCountdown(null)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">Test Countdown</h3>
      
      <div className="mb-4">
        <p>Countdown: {countdown !== null ? `${countdown}s` : 'Not started'}</p>
        <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={startCountdown}
          disabled={isActive}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Start 7s Countdown
        </button>
        
        <button
          onClick={stopCountdown}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop
        </button>
      </div>
    </div>
  )
}
