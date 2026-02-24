'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { createTriageRecord } from './actions'

type Patient = {
    id: string
    first_name: string
    last_name: string
    dob: string
}

export default function NewTriageModal({
    isOpen,
    onClose,
    patients
}: {
    isOpen: boolean
    onClose: () => void
    patients: Patient[]
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatientId, setSelectedPatientId] = useState<string>('')

    const [bpSys, setBpSys] = useState('')
    const [bpDia, setBpDia] = useState('')
    const [hr, setHr] = useState('')
    const [temp, setTemp] = useState('')
    const [spo2, setSpo2] = useState('')
    const [priority, setPriority] = useState('')

    useEffect(() => {
        if (!bpSys && !hr && !temp && !spo2) {
            setPriority('')
            return
        }

        const sys = Number(bpSys)
        const heart = Number(hr)
        const temperature = Number(temp)
        const oxygen = Number(spo2)

        let newPriority = 'Normal'

        // Emergency criteria (Red)
        if (
            (sys > 0 && (sys <= 90 || sys >= 220)) ||
            (heart > 0 && (heart <= 40 || heart >= 130)) ||
            (temperature > 0 && (temperature <= 35 || temperature >= 39.1)) ||
            (oxygen > 0 && oxygen <= 91)
        ) {
            newPriority = 'Emergency'
        }
        // Urgent criteria (Orange)
        else if (
            (sys > 0 && (sys <= 100 || sys >= 200)) ||
            (heart > 0 && (heart <= 50 || heart >= 110)) ||
            (temperature > 0 && (temperature <= 36 || temperature >= 38.1)) ||
            (oxygen > 0 && oxygen <= 95)
        ) {
            newPriority = 'Urgent'
        }

        setPriority(newPriority)
    }, [bpSys, hr, temp, spo2])

    if (!isOpen) return null

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) // limit results

    const handleSubmit = async (formData: FormData) => {
        if (!selectedPatientId) {
            alert("Please select a patient first.")
            return
        }

        formData.append('patient_id', selectedPatientId)

        setIsSubmitting(true)
        try {
            await createTriageRecord(formData)
            onClose()
            setSelectedPatientId('')
            setSearchQuery('')
            setBpSys('')
            setBpDia('')
            setHr('')
            setTemp('')
            setSpo2('')
            setPriority('')
        } catch (error) {
            console.error(error)
            alert("Failed to save triage assessment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Triage Assessment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {/* Patient Selection Section */}
                    <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">1. Select Patient</h3>
                        {!selectedPatientId ? (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search registered patients..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                                {searchQuery && (
                                    <ul className="bg-white border text-sm rounded-lg overflow-hidden divide-y">
                                        {filteredPatients.map(p => (
                                            <li
                                                key={p.id}
                                                className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => setSelectedPatientId(p.id)}
                                            >
                                                <span className="font-semibold text-slate-800">{p.first_name} {p.last_name}</span>
                                                <span className="text-slate-500 text-xs">DOB: {new Date(p.dob).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                        {filteredPatients.length === 0 && <li className="p-3 text-slate-500 text-center">No patients found</li>}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-indigo-200">
                                {(() => {
                                    const p = patients.find(p => p.id === selectedPatientId)
                                    return (
                                        <div>
                                            <span className="font-semibold text-slate-800">{p?.first_name} {p?.last_name}</span>
                                            <span className="text-slate-500 text-xs ml-2">Selected</span>
                                        </div>
                                    )
                                })()}
                                <button onClick={() => setSelectedPatientId('')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Change</button>
                            </div>
                        )}
                    </div>

                    {/* Vitals Form Section */}
                    <form id="triageForm" action={handleSubmit} className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">2. Record Vitals</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Sys BP (mmHg) <span className="text-red-500">*</span></label>
                                <input name="bp_sys" value={bpSys} onChange={(e) => setBpSys(e.target.value)} type="number" required placeholder="120" className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Dia BP (mmHg) <span className="text-red-500">*</span></label>
                                <input name="diastolic_bp" value={bpDia} onChange={(e) => setBpDia(e.target.value)} type="number" required placeholder="80" className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">HR (bpm) <span className="text-red-500">*</span></label>
                                <input name="heart_rate" value={hr} onChange={(e) => setHr(e.target.value)} type="number" required placeholder="75" className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Temp (°C) <span className="text-red-500">*</span></label>
                                <input name="temperature" value={temp} onChange={(e) => setTemp(e.target.value)} type="number" step="0.1" required placeholder="37.0" className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">SpO2 (%) <span className="text-red-500">*</span></label>
                                <input name="spo2" value={spo2} onChange={(e) => setSpo2(e.target.value)} type="number" required placeholder="98" className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                            </div>

                            <div className="space-y-1 sm:col-span-3">
                                <label className="text-xs font-medium text-slate-700">Priority Level <span className="text-red-500">*</span></label>
                                <select
                                    name="priority_level"
                                    required
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${priority === 'Emergency' ? 'bg-red-50 border-red-300 text-red-700 font-bold' :
                                        priority === 'Urgent' ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold' :
                                            priority === 'Normal' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' :
                                                'bg-white border-slate-300 text-slate-900'
                                        }`}
                                >
                                    <option value="">Select Priority...</option>
                                    <option value="Emergency" className="text-red-600 font-semibold bg-white">🔴 Emergency</option>
                                    <option value="Urgent" className="text-amber-600 font-semibold bg-white">🟠 Urgent</option>
                                    <option value="Normal" className="text-emerald-600 font-semibold bg-white">🟢 Normal</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Symptoms & Notes <span className="text-red-500">*</span></label>
                            <textarea
                                name="symptoms"
                                rows={3}
                                required
                                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Chief complaint, visible symptoms..."
                            />
                        </div>
                    </form>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="triageForm"
                        disabled={isSubmitting || !selectedPatientId}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Queue Patient'}
                    </button>
                </div>
            </div>
        </div>
    )
}
