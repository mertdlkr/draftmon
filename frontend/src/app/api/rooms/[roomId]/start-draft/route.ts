import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/lib/contracts/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { adminSecret } = await req.json()

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
    }

    const db = createSupabaseAdminClient()
    const { error } = await db.from('rooms').update({
      status: 'drafting',
      draft_started_at: new Date().toISOString(),
    }).eq('id', roomId)

    if (error) throw error

    return NextResponse.json({ success: true, data: { started: true } } satisfies ApiResponse<{ started: true }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
