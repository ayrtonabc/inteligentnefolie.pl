'use client'

import { createContext, useContext, ReactNode } from 'react'

interface SerpBearContextType {
  websiteId: string | null
}

const SerpBearContext = createContext<SerpBearContextType>({
  websiteId: null
})

export function SerpBearProvider({ children, websiteId }: { children: ReactNode; websiteId: string | null }) {
  return (
    <SerpBearContext.Provider value={{ websiteId }}>
      {children}
    </SerpBearContext.Provider>
  )
}

export function useSerpBearContext() {
  return useContext(SerpBearContext)
}
