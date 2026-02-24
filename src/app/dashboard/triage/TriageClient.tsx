'use client'

import { useState } from 'react'
import { Activity, Thermometer, HeartPulse, AlertCircle, Clock } from 'lucide-react'
import NewTriageModal from './NewTriageModal'

// Define triage record type matching our query
type TriageRecord = {
    id: string
    bp_sys: number
    diastolic_bp: number
    heart_rate: number
    temperature: number
    spo2: number
    symptoms: string
    priority_level: string
    created_at: string
    patient: {
        first_name: string
        last_name: string
    }
}

type Patient = {
    id: string
    first_name: string
    last_name: string
    dob: string
}

export default function TriageClient({
    initialRecords,
    patients
}: {
    initialRecords: TriageRecord[] | null,
    patients: Patient[] | null
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const getPriorityColor = (level: string) => {
        switch (level) {
            case 'Emergency': return 'bg-red-100 text-red-700 border-red-200'
            case 'Urgent': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'Normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    // Count priorities
    const emergencyCount = initialRecords?.filter(r => r.priority_level === 'Emergency').length || 0
    const urgentCount = initialRecords?.filter(r => r.priority_level === 'Urgent').length || 0
    const normalCount = initialRecords?.filter(r => r.priority_level === 'Normal').length || 0

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Triage Queue</h1>
                    <p className="text-slate-500 mt-1">Record vitals and assess patient priority.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-md shadow-emerald-200 flex items-center space-x-2"
                >
                    <Activity className="w-5 h-5" />
                    <span>New Triage Assessment</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Waiting Patients</h2>

                    {initialRecords?.map((record) => (
                        <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-emerald-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                                        {record.patient.first_name[0]}{record.patient.last_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{record.patient.first_name} {record.patient.last_name}</h3>
                                        <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Assessed {Math.floor((Date.now() - new Date(record.created_at).getTime()) / 60000)} mins ago</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getPriorityColor(record.priority_level)}`}>
                                    {record.priority_level}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                                        <Activity className="w-4 h-4 text-rose-500" />
                                        <span className="text-xs font-medium">BP</span>
                                    </div>
                                    <div className="font-semibold text-slate-800">{record.bp_sys}/{record.diastolic_bp}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                                        <HeartPulse className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-medium">HR</span>
                                    </div>
                                    <div className="font-semibold text-slate-800">{record.heart_rate} bpm</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                                        <Thermometer className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-medium">Temp</span>
                                    </div>
                                    <div className="font-semibold text-slate-800">{record.temperature}°C</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
                                        <Activity className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-medium">SpO2</span>
                                    </div>
                                    <div className="font-semibold text-slate-800">{record.spo2}%</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-700"><span className="font-semibold mr-2">Symptoms:</span>{record.symptoms}</p>
                            </div>
                        </div>
                    ))}

                    {(!initialRecords || initialRecords.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">The triage queue is currently empty.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center mb-4">
                            <AlertCircle className="w-5 h-5 text-indigo-600 mr-2" />
                            Queue Status
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Total Waiting</span>
                                <span className="font-bold text-slate-800 text-lg">{initialRecords?.length || 0}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-slate-600">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
                                    Emergency
                                </div>
                                <span className="font-bold text-slate-800">{emergencyCount}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-slate-600">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></div>
                                    Urgent
                                </div>
                                <span className="font-bold text-slate-800">{urgentCount}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-slate-600">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div>
                                    Normal
                                </div>
                                <span className="font-bold text-slate-800">{normalCount}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <NewTriageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} patients={patients || []} />
        </div>
    )
}
