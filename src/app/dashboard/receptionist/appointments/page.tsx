import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { Calendar, User, Clock, FileText, CheckCircle, XCircle } from 'lucide-react'
import { updateAppointmentStatus } from './actions'

export default async function ReceptionistAppointmentsPage() {
    const supabase = await createClient()

    // Admin/Receptionist check should ideally be in middleware or layout, but doing a quick check here
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || user.user_metadata?.role || 'receptionist'

    if (role !== 'admin' && role !== 'receptionist') {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>
    }

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            patients (
                first_name,
                last_name,
                phone
            )
        `)
        .eq('status', 'pending')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    const pendingAppointments = appointments || []

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <PageHeader
                kicker="Receptionist"
                title="Pending Appointments"
                subtitle="Review and approve online appointment requests from patients."
            />

            {pendingAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Pending Requests</h3>
                    <p className="text-slate-500">All appointment requests have been processed.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-indigo-100 transition">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">
                                            {apt.patients?.first_name} {apt.patients?.last_name}
                                        </h4>
                                        <p className="text-sm text-slate-500">{apt.patients?.phone || 'No phone provided'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-flex">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-2 border-l border-slate-300 pl-4">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {apt.appointment_time}
                                    </span>
                                </div>

                                {apt.reason && (
                                    <p className="text-sm text-slate-600 flex items-start gap-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                        <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        {apt.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <form action={async () => {
                                    'use server'
                                    await updateAppointmentStatus(apt.id, 'rejected')
                                }}>
                                    <button 
                                        type="submit"
                                        className="w-full md:w-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Decline
                                    </button>
                                </form>
                                <form action={async () => {
                                    'use server'
                                    await updateAppointmentStatus(apt.id, 'approved')
                                }}>
                                    <button 
                                        type="submit"
                                        className="w-full md:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve Visit
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
