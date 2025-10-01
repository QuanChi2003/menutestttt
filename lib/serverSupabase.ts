import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function getServerSupabase() {
  return createRouteHandlerClient<Database>({ cookies })
}
