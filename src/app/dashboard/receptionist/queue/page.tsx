import { createClient } from '@/utils/supabase/server'
import { Activity, Clock, User } from 'lucide-react'

export default async function ReceptionistQueuePage() {
    const supabase = await createClient()

    const { data: queue } = await supabase
        .from('queue')
        .select(`
            id,
            joined_at,
            status,
            patients (
                first_name,
                last_name
            ),
            triage_records (
                priority_level
            )
        `)
        .eq('status', 'waiting')
        .order('joined_at', { ascending: true })

    const getPriorityColor = (level: string) => {
        switch (level) {
            case 'Emergency': return 'bg-red-100 text-red-700'
            case 'Urgent': return 'bg-amber-100 text-amber-700'
            case 'Normal': return 'bg-emerald-100 text-emerald-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Live Queue</h1>
                <p className="text-slate-500 mt-1">Current status of patients waiting for triage or consultation.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <span>Active Waiting Queue</span>
                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{queue?.length || 0} Patients</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-white border-b border-slate-200 text-slate-800 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Wait Time</th>
                                <th className="px-6 py-4">Priority (Triage)</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {queue?.map((item: any) => {
                                const patient = Array.isArray(item.patients) ? item.patients[0] : (item.patients || {})
                                const triage = Array.isArray(item.triage_records) ? item.triage_records[0] : (item.triage_records || {})
                                const waitMs = Date.now() - new Date(item.joined_at).getTime()
                                const waitMins = Math.floor(waitMs / 60000)

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                                                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                </div>
                                                <div className="font-medium text-slate-800">
                                                    {patient.first_name} {patient.last_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-slate-500">
                                                <Clock className="w-4 h-4" />
                                                <span>{waitMins} mins</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {triage.priority_level ? (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getPriorityColor(triage.priority_level)}`}>
                                                    {triage.priority_level}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Waiting for Triage</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-indigo-600 font-medium capitalize">{item.status}</span>
                                        </td>
                                    </tr>
                                )
                            })}

                            {(!queue || queue.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p>The queue is currently empty.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start space-x-3">
                <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div className="text-sm text-indigo-800">
                    <p className="font-semibold">Receptionist Notice</p>
                    <p className="mt-1">This is a read-only view. For registration or patient updates, please use the <strong>Patients</strong> menu.</p>
                </div>
            </div>
        </div>
    )
}
