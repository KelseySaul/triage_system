import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { Calendar as CalendarIcon, Clock, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { bookAppointment } from './actions'

export default async function PatientAppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get patient ID
    const { data: patientRecord } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    let appointments: any[] = []

    if (patientRecord) {
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patientRecord.id)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false })
            
        appointments = data || []
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
            case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <AlertCircle className="w-5 h-5 text-slate-400" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case 'pending': return "bg-amber-50 text-amber-700 border-amber-200"
            case 'rejected': return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-slate-50 text-slate-700 border-slate-200"
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <PageHeader
                kicker="Appointments"
                title="Manage Appointments"
                subtitle="Book a new visit or check the status of your upcoming consultations."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-indigo-500" />
                            Request Appointment
                        </h3>
                        
                        <form action={bookAppointment} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="appointment_date" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Date</label>
                                <input
                                    id="appointment_date"
                                    name="appointment_date"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label htmlFor="appointment_time" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Time Preference</label>
                                <input
                                    id="appointment_time"
                                    name="appointment_time"
                                    type="time"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="reason" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Reason for Visit</label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows={3}
                                    placeholder="Briefly describe your symptoms or reason for the visit..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 transform transition md:hover:-translate-y-0.5 mt-2"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Your History</h3>
                    
                    {appointments.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <CalendarIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-800 font-bold mb-1">No Appointments Found</h3>
                            <p className="text-slate-500 text-sm">You haven't requested any appointments yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-100 transition">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {getStatusIcon(apt.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-800">
                                                    {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(apt.status)} capitalize`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500 gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {apt.appointment_time}
                                                </span>
                                            </div>
                                            {apt.reason && (
                                                <p className="text-sm text-slate-600 mt-2 flex gap-1.5 max-w-lg">
                                                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                    {apt.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
