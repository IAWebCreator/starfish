export interface User {
  id?: number
  wallet_address: string
  name?: string | null
  telegram_username: string
  created_at?: string
  updated_at?: string
}

export interface Bot {
  id?: number
  bot_name: string
  bot_type: 'dapp' | 'custom'
  token_id?: string
  created_at?: string
  updated_at?: string
}

export interface Agent {
  id?: number
  user_id: number
  bot_id: number
  name: string
  description: string
  instructions: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Activation {
  id?: number
  agent_id: number
  transaction_id: string
  verification_code?: string
  telegram_authorized_user: string
  duration_hours: number
  activation_status: 'pending' | 'active' | 'expired'
  created_at?: string
  updated_at?: string
} 