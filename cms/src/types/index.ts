export interface Project {
  id: string
  title: string
  description: string
  image: string
  status: 'active' | 'completed' | 'pending'
  budget: number
  startDate: string
  endDate?: string
  category: string
}

export interface Investment {
  id: string
  title: string
  description: string
  amount: number
  returnRate: number
  duration: string
  riskLevel: 'low' | 'medium' | 'high'
  status: 'open' | 'closed'
  minInvestment: number
  image: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  date: string
  status: 'new' | 'read' | 'replied'
}
