import { createClient } from '@/utils/supabase/server'
import { Activity, Clock, Users, ArrowRight, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
    const role = profile?.role || 'receptionist'

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { count: patientsToday } = await supabase
        .from('queue')
        .select('*', { count: 'exact', head: true })
        .gte('joined_at', startOfDay.toISOString())

    const { data: criticalCases } = await supabase
        .from('queue')
        .select(`
        id,
        status,
        triage_records!inner(priority_level)
    `)
        .eq('status', 'waiting')
        .in('triage_records.priority_level', ['Emergency', 'Urgent'])

    const criticalCount = criticalCases?.length || 0

    const { data: waitingQueue } = await supabase
        .from('queue')
        .select('joined_at')
        .eq('status', 'waiting')

    let avgWaitMins = 0
    if (waitingQueue && waitingQueue.length > 0) {
        const totalWaitMs = waitingQueue.reduce((acc, q) => {
            return acc + (Date.now() - new Date(q.joined_at).getTime())
        }, 0)
        avgWaitMins = Math.floor((totalWaitMs / waitingQueue.length) / 60000)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <PageHeader
                kicker="Today"
                title="Overview"
                subtitle={`Welcome back, ${profile?.full_name || 'User'}. Here is your live daily summary.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Patients Queued Today"
                    value={patientsToday || 0}
                    helper="Since midnight"
                    icon={<Users className="w-6 h-6" />}
                    tone="info"
                />
                <StatCard
                    label="Wait Time (Avg)"
                    value={`${avgWaitMins}m`}
                    helper="Current waiting queue"
                    icon={<Clock className="w-6 h-6" />}
                    tone="warning"
                />
                <StatCard
                    label="Critical Cases"
                    value={criticalCount}
                    helper="Emergency or Urgent in queue"
                    icon={<Activity className="w-6 h-6" />}
                    tone="danger"
                />
            </div>

            <h2 className="text-xl font-bold text-slate-800 tracking-tight pt-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(role === 'receptionist' || role === 'admin') && (
                    <Link href="/dashboard/patients" className="group cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">Register Patient</h4>
                                <p className="text-xs text-slate-500">Add a new patient record</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
                    </Link>
                )}

                {(role === 'nurse' || role === 'admin') && (
                    <Link href="/dashboard/triage" className="group cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">Process Triage</h4>
                                <p className="text-xs text-slate-500">Record vitals and queue</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                    </Link>
                )}

                {(role === 'doctor' || role === 'admin') && (
                    <Link href="/dashboard/consultations" className="group cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">Next Consultation</h4>
                                <p className="text-xs text-slate-500">See waiting patients</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                    </Link>
                )}
            </div>

        </div>
    )
}
