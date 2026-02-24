import { Users, UserPlus, ClipboardList, Activity, Stethoscope, LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Determine role.
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const role = profile?.role || 'receptionist'

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 flex items-center space-x-3">
                    <Activity className="w-8 h-8 text-indigo-300" />
                    <span className="text-xl font-bold tracking-tight">Triage System</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                        <ClipboardList className="w-5 h-5 text-indigo-300" />
                        <span className="font-medium text-indigo-50">Overview</span>
                    </Link>

                    {(role === 'receptionist' || role === 'admin') && (
                        <>
                            <Link href="/dashboard/patients" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                                <Users className="w-5 h-5 text-indigo-300" />
                                <span className="font-medium text-indigo-50">Patients</span>
                            </Link>
                            <Link href="/dashboard/receptionist/queue" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                                <Activity className="w-5 h-5 text-indigo-300" />
                                <span className="font-medium text-indigo-50">Live Queue</span>
                            </Link>
                        </>
                    )}

                    {(role === 'nurse' || role === 'admin') && (
                        <Link href="/dashboard/triage" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                            <Activity className="w-5 h-5 text-indigo-300" />
                            <span className="font-medium text-indigo-50">Triage Queue</span>
                        </Link>
                    )}

                    {(role === 'doctor' || role === 'admin') && (
                        <Link href="/dashboard/consultations" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                            <Stethoscope className="w-5 h-5 text-indigo-300" />
                            <span className="font-medium text-indigo-50">Consultations</span>
                        </Link>
                    )}

                    {role === 'admin' && (
                        <Link href="/dashboard/admin/users" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition">
                            <ShieldCheck className="w-5 h-5 text-indigo-300" />
                            <span className="font-medium text-indigo-50">User Access</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center space-x-3 mb-4 px-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-indigo-300 truncate capitalize">{role}</p>
                        </div>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center justify-center space-x-2 px-3 py-2 bg-indigo-800 hover:bg-indigo-700 text-sm font-medium rounded-lg transition">
                            <LogOut className="w-4 h-4" />
                            <span>Log out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header section could go here if needed for mobile auth, etc. */}
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
