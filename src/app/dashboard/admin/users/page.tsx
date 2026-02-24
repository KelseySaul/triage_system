import { createClient } from '@/utils/supabase/server'
import { ShieldCheck } from 'lucide-react'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    // 1. Verify Admin Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
                <p className="text-slate-500 mt-2 max-w-sm">You do not have the required administrative privileges to view this page.</p>
            </div>
        )
    }

    // Fetch all profiles
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

    return <AdminUsersClient profiles={profiles || []} />
}
