import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://voeijpbfqyxonvvrokfk.supabase.co'
const supabaseAnonKey = 'sb_publishable_kzYxa6kdn1QkS3yjS42G6Q_XeaZ6mVx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
