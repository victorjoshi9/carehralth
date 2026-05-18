import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://tlvjyqfodafzdetzclnx.supabase.co'
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AA11adp3DiOUBHqWW7RX2w_rCDCoMds'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
