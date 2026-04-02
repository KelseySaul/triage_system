import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { Activity, Stethoscope, Pill, Calendar, Clock, ChevronDown } from 'lucide-react'
import { fetchPatientHistory } from '../../consultations/historyActions'

export default async function PatientHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get patient ID
    const { data: patientRecord } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    let consultations: any[] = []
    let vitals: any[] = []

    if (patientRecord) {
        const history = await fetchPatientHistory(patientRecord.id)
        consultations = history.consultations || []
        vitals = history.vitals || []
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <PageHeader
                kicker="Medical Records"
                title="Your History"
                subtitle="Review your past consultations, triage readings, and prescribed medications."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Consultations Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                        Past Consultations
                    </h3>

                    {consultations.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                            <Stethoscope className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No past consultations found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {consultations.map((consult) => (
                                <div key={consult.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(consult.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</span>
                                            <p className="text-slate-800 font-medium">{consult.diagnosis || 'No diagnosis recorded'}</p>
                                        </div>

                                        {consult.notes && (
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Doctor's Notes</span>
                                                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">{consult.notes}</p>
                                            </div>
                                        )}

                                        {consult.prescriptions && consult.prescriptions.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                                                    <Pill className="w-3.5 h-3.5 text-indigo-400" /> Prescriptions
                                                </span>
                                                <ul className="space-y-2">
                                                    {consult.prescriptions.map((rx: any) => (
                                                        <li key={rx.id} className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 flex justify-between items-center text-sm">
                                                            <div>
                                                                <span className="font-bold text-indigo-900 block">{rx.medication_name}</span>
                                                                <span className="text-indigo-600/80 text-xs">{rx.dosage} • {rx.frequency}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs font-bold text-indigo-500 bg-white px-2 py-1 rounded-md shadow-sm border border-indigo-50">{rx.duration}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vitals Column */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Triage History
                    </h3>

                    {vitals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No triage records found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {vitals.map((vital) => (
                                <div key={vital.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                            <Clock className="w-4 h-4 relative -top-0.5" />
                                            {new Date(vital.created_at).toLocaleDateString()}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md border capitalize ${
                                            vital.priority_level === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200' :
                                            vital.priority_level === 'Urgent' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                            {vital.priority_level}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Pressure</div>
                                            <div className="font-bold text-slate-800 text-lg leading-none">{vital.bp_sys}/{vital.diastolic_bp}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">mmHg</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Heart Rate</div>
                                            <div className="font-bold text-slate-800 text-lg leading-none">{vital.heart_rate}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">bpm</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temperature</div>
                                            <div className="font-bold text-slate-800 text-lg leading-none">{vital.temperature}°</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Celsius</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SpO2</div>
                                            <div className="font-bold text-slate-800 text-lg leading-none">{vital.spo2}%</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Oxygen</div>
                                        </div>
                                    </div>

                                    {vital.symptoms && (
                                        <div className="mt-3 text-sm">
                                            <span className="font-bold text-slate-600 block mb-1">Reported Symptoms:</span>
                                            <p className="text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">{vital.symptoms}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
