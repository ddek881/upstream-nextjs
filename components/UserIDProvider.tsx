'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface UserIDContextType {
  userId: string | null
  setUserId: (id: string) => void
  isLoading: boolean
}

const UserIDContext = createContext<UserIDContextType | undefined>(undefined)

export function UserIDProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if userId exists in localStorage
    const storedUserId = localStorage.getItem('currentUserId')
    
    if (storedUserId) {
      // User ID already exists
      setUserIdState(storedUserId)
      setIsLoading(false)
    } else {
      // Generate new user ID
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('currentUserId', newUserId)
      setUserIdState(newUserId)
      setIsLoading(false)
      
      console.log('🆔 Generated new User ID:', newUserId)
    }
  }, [])

  const setUserId = (id: string) => {
    localStorage.setItem('currentUserId', id)
    setUserIdState(id)
  }

  return (
    <UserIDContext.Provider value={{ userId, setUserId, isLoading }}>
      {children}
    </UserIDContext.Provider>
  )
}

export function useUserID() {
  const context = useContext(UserIDContext)
  if (context === undefined) {
    throw new Error('useUserID must be used within a UserIDProvider')
  }
  return context
}
