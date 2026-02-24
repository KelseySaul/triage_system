'use client'

import { X, Calendar, Phone, Activity, Heart, Thermometer, Droplets } from 'lucide-react'

type Patient = {
    id: string
    first_name: string
    last_name: string
    dob: string
    gender: string
    phone: string
    medical_history: string
}

export default function ViewPatientModal({
    isOpen,
    onClose,
    patient
}: {
    isOpen: boolean
    onClose: () => void
    patient: Patient | null
}) {
    if (!isOpen || !patient) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Patient Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold uppercase">
                            {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{patient.first_name} {patient.last_name}</h3>
                            <p className="text-slate-500">ID: {patient.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                            <div className="flex items-center space-x-2 text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{new Date(patient.dob).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</p>
                            <div className="flex items-center space-x-2 text-slate-700">
                                <Activity className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{patient.gender}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                            <div className="flex items-center space-x-2 text-slate-700">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{patient.phone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medical History</p>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                            {patient.medical_history || 'No recorded medical history for this patient.'}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
