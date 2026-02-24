'use client'

import { useState, useEffect } from 'react'
import { X, Activity, ClipboardList, Thermometer, CalendarClock } from 'lucide-react'
import { fetchPatientHistory } from './historyActions'

type HistoryModalProps = {
    isOpen: boolean
    onClose: () => void
    patient: {
        id: string
        first_name: string
        last_name: string
        dob: string
    } | null
}

export default function PatientHistoryModal({ isOpen, onClose, patient }: HistoryModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [history, setHistory] = useState<any>(null)

    useEffect(() => {
        if (isOpen && patient?.id) {
            setIsLoading(true)
            fetchPatientHistory(patient.id)
                .then(data => setHistory(data))
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, patient])

    if (!isOpen || !patient) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 bg-white border-b border-slate-200 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Patient Medical History</h2>
                        <p className="text-slate-500 text-sm mt-1">{patient.first_name} {patient.last_name} • DOB: {new Date(patient.dob).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Activity className="w-10 h-10 animate-pulse mb-3" />
                            <p>Loading records...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Past Consultations */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center pb-2 border-b border-indigo-100">
                                    <ClipboardList className="w-5 h-5 text-indigo-600 mr-2" />
                                    Past Consultations
                                </h3>

                                {history?.consultations?.map((c: any) => (
                                    <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-sm font-semibold text-slate-700 block mb-0.5">Diagnosis</span>
                                            <p className="text-slate-800 font-medium">{c.diagnosis || 'None recorded'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-slate-700 block mb-0.5">Notes</span>
                                            <p className="text-sm text-slate-600 whitespace-pre-line mb-3">{c.notes || 'No notes'}</p>
                                        </div>

                                        {c.prescriptions && c.prescriptions.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-emerald-50">
                                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2">Prescribed Medications</span>
                                                <div className="space-y-2">
                                                    {c.prescriptions.map((p: any) => (
                                                        <div key={p.id} className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50 text-sm">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-bold text-slate-800">{p.medication_name}</span>
                                                                <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">{p.dosage}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{p.frequency} • {p.duration}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {(!history?.consultations || history.consultations.length === 0) && (
                                    <div className="text-center p-6 bg-slate-100 rounded-xl border border-slate-200 border-dashed text-slate-500 text-sm">
                                        No past consultations found.
                                    </div>
                                )}
                            </div>

                            {/* Past Vitals */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 flex items-center pb-2 border-b border-red-100">
                                    <Activity className="w-5 h-5 text-red-600 mr-2" />
                                    Triage Vitals History
                                </h3>

                                {history?.vitals?.map((v: any) => (
                                    <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center text-xs text-slate-500 mb-3 space-x-2">
                                            <CalendarClock className="w-3.5 h-3.5" />
                                            <span>{new Date(v.created_at).toLocaleString()}</span>
                                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${v.priority_level === 'Emergency' ? 'bg-red-100 text-red-700' : v.priority_level === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {v.priority_level}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                                                <span className="text-slate-500 text-xs block mb-0.5">Blood Pressure</span>
                                                <span className="font-semibold text-slate-800">{v.bp_sys}/{v.diastolic_bp}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                                                <span className="text-slate-500 text-xs block mb-0.5">Heart Rate</span>
                                                <span className="font-semibold text-slate-800">{v.heart_rate} bpm</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                                                <span className="text-slate-500 text-xs block mb-0.5 whitespace-nowrap"><Thermometer className="w-3 h-3 inline mr-1 -mt-0.5" />Temp</span>
                                                <span className="font-semibold text-slate-800">{v.temperature}°C</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                                                <span className="text-slate-500 text-xs block mb-0.5">SpO2</span>
                                                <span className="font-semibold text-slate-800">{v.spo2}%</span>
                                            </div>
                                        </div>
                                        {v.symptoms && (
                                            <div className="mt-3 text-sm">
                                                <span className="text-slate-500 text-xs font-semibold block mb-0.5">Symptoms Reported:</span>
                                                <p className="text-slate-700">{v.symptoms}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {(!history?.vitals || history.vitals.length === 0) && (
                                    <div className="text-center p-6 bg-slate-100 rounded-xl border border-slate-200 border-dashed text-slate-500 text-sm">
                                        No past vital records found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
