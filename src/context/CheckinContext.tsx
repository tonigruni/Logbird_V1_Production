// src/context/CheckinContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CheckinContextValue {
  isOpen: boolean
  openCheckin: () => void
  closeCheckin: () => void
}

const CheckinContext = createContext<CheckinContextValue>({
  isOpen: false,
  openCheckin: () => {},
  closeCheckin: () => {},
})

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const openCheckin  = useCallback(() => setIsOpen(true),  [])
  const closeCheckin = useCallback(() => setIsOpen(false), [])

  return (
    <CheckinContext.Provider value={{ isOpen, openCheckin, closeCheckin }}>
      {children}
    </CheckinContext.Provider>
  )
}

export function useCheckin() {
  return useContext(CheckinContext)
}
