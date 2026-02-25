'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, ClipboardList, Pill, CalendarClock, Download, Edit3, Activity, Clock } from 'lucide-react'
import { attendToPatient, finishConsultation, addPrescription } from './actions'
import PatientHistoryModal from './PatientHistoryModal'

type Prescription = {
    id: string
    medication_name: string
    dosage: string
    frequency: string
    duration: string
}

type PatientListRef = {
    id: string
    first_name: string
    last_name: string
    gender: string
    dob: string
}

type ConsultationParams = {
    id: string
    patient: PatientListRef
    diagnosis: string
    notes: string
    created_at: string
    prescriptions: Prescription[]
}

type QueueItem = {
    id: string
    joined_at: string
    patient: {
        id: string
        first_name: string
        last_name: string
    }
    triage: {
        priority_level: string
        bp_sys: number
        diastolic_bp: number
        heart_rate: number
        temperature: number
    }
}

export default function ConsultationsClient({
    liveQueue,
    pastConsultations
}: {
    liveQueue: QueueItem[],
    pastConsultations: ConsultationParams[]
}) {
    const router = useRouter()
    const [activeConsultation, setActiveConsultation] = useState<ConsultationParams | null>(pastConsultations.length > 0 ? (pastConsultations.find(c => c.diagnosis === '' || c.notes === '') || pastConsultations[0]) : null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Local state for editing the active consultation
    const [editMode, setEditMode] = useState(false)
    const [localDiagnosis, setLocalDiagnosis] = useState('')
    const [localNotes, setLocalNotes] = useState('')
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)

    // Sync activeConsultation with props when they update (e.g. after prescription added)
    // If activeConsultation is null, currentActive will also be null (or handled by the UI check)
    const currentActive = activeConsultation ? (pastConsultations.find(c => c.id === activeConsultation.id) || activeConsultation) : null

    const handlePrintReceipt = () => {
        window.print()
    }

    const handleAttend = async (queueItem: QueueItem) => {
        setIsProcessing(true)
        setToast(null)
        try {
            const consultation = await attendToPatient(queueItem.id, queueItem.patient.id)
            setActiveConsultation({
                id: consultation.id,
                created_at: consultation.created_at,
                diagnosis: '',
                notes: '',
                patient: {
                    id: queueItem.patient.id,
                    first_name: queueItem.patient.first_name,
                    last_name: queueItem.patient.last_name,
                    gender: 'Unknown',
                    dob: '' as any,
                },
                prescriptions: []
            } as ConsultationParams)
            setEditMode(true)
            setLocalDiagnosis('')
            setLocalNotes('')
            setToast({ type: 'success', message: 'Patient assigned. Consultation started.' })
            router.refresh()
        } catch (e) {
            console.error(e)
            setToast({ type: 'error', message: 'Failed to attend to patient. Please try again.' })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleFinish = async () => {
        if (!activeConsultation) return
        setIsProcessing(true)
        setToast(null)
        try {
            await finishConsultation(activeConsultation.id, localDiagnosis, localNotes)

            // Manually update the activeConsultation state to reflect the new diagnosis/notes
            // This ensures editing works again immediately without waiting for a full re-render loop if any.
            setActiveConsultation({
                ...activeConsultation,
                diagnosis: localDiagnosis,
                notes: localNotes
            })

            setEditMode(false)
            setToast({ type: 'success', message: 'Consultation saved successfully.' })
        } catch (e) {
            console.error(e)
            setToast({ type: 'error', message: 'Failed to save consultation. Please try again.' })
        } finally {
            setIsProcessing(false)
        }
    }

    const getPriorityColor = (level: string) => {
        switch (level) {
            case 'Emergency': return 'bg-red-100 text-red-700'
            case 'Urgent': return 'bg-amber-100 text-amber-700'
            case 'Normal': return 'bg-emerald-100 text-emerald-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Doctor Workspace</h1>
                    <p className="text-slate-500 mt-1">Manage the Live Queue and your active consultations.</p>
                </div>
                <div className="flex space-x-3 print:hidden">
                    {activeConsultation?.diagnosis && (
                        <button
                            onClick={handlePrintReceipt}
                            className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl font-bold transition shadow-sm flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5 text-indigo-600" />
                            <span>Print Patient Receipt</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden relative">
                {toast && (
                    <div className="fixed top-4 right-4 z-50">
                        <div
                            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
                                toast.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                        >
                            {toast.message}
                        </div>
                    </div>
                )}

                {/* Left Sidebar - Live Queue & History */}
                <div className="lg:col-span-4 space-y-6 flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">

                    {/* Card 1: Live Triage Queue */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col flex-1">
                        <div className="p-4 border-b border-slate-200 bg-red-50 font-bold text-red-900 flex justify-between items-center">
                            <span className="flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-red-600" />
                                Live Triage Queue
                            </span>
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{liveQueue.length} Waiting</span>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {liveQueue.map((q) => (
                                <div key={q.id} className="p-5 hover:bg-slate-50 transition border-l-4 border-transparent hover:border-red-400">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-bold text-slate-800 text-base">{q.patient.first_name} {q.patient.last_name}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getPriorityColor(q.triage.priority_level)}`}>
                                            {q.triage.priority_level}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-2 flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-medium">BP</span>
                                            <span className="font-bold text-slate-700">{q.triage.bp_sys}/{q.triage.diastolic_bp}</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-2 flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-medium">HR</span>
                                            <span className="font-bold text-slate-700">{q.triage.heart_rate}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAttend(q)}
                                        disabled={isProcessing}
                                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
                                    >
                                        Attend to Patient
                                    </button>
                                </div>
                            ))}

                            {liveQueue.length === 0 && (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
                                    <Clock className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm font-medium">The live queue is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2: Recent Consultations */}
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-72">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 text-sm flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                            Recent Consultations
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {pastConsultations.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        setActiveConsultation(c)
                                        setEditMode(false)
                                        setLocalDiagnosis(c.diagnosis)
                                        setLocalNotes(c.notes)
                                    }}
                                    className={`p-4 cursor-pointer transition text-sm flex justify-between items-center border-l-4 ${currentActive?.id === c.id ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-600 border-transparent'}`}
                                >
                                    <span className="truncate">{c.patient.first_name} {c.patient.last_name}</span>
                                    <span className="text-xs font-medium text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                            {pastConsultations.length === 0 && (
                                <div className="p-6 text-center text-slate-400 text-xs italic">
                                    No recent records.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content - Active Consultation */}
                <div className="lg:col-span-8 space-y-6">
                    {currentActive ? (
                        <>
                            {/* Summary Header */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-start justify-between">
                                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold uppercase">
                                        {currentActive.patient.first_name[0]}{currentActive.patient.last_name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">{currentActive.patient.first_name} {currentActive.patient.last_name}</h2>
                                        <p className="text-slate-500">{currentActive.patient.gender} • DOB: {new Date(currentActive.patient.dob).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3 print:hidden">
                                    <button
                                        onClick={() => setIsHistoryModalOpen(true)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm border border-slate-200"
                                    >
                                        Full History
                                    </button>
                                    {editMode ? (
                                        <button
                                            onClick={handleFinish}
                                            disabled={isProcessing || !localDiagnosis}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Saving...' : 'Save & Update'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditMode(true)
                                                setLocalDiagnosis(currentActive.diagnosis)
                                                setLocalNotes(currentActive.notes)
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition flex items-center space-x-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span>{currentActive.diagnosis ? 'Edit Consultation' : 'Start Consultation'}</span>
                                        </button>
                                    )}

                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Diagnosis & Notes */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center">
                                            <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" />
                                            Diagnosis & Notes
                                        </h3>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        {editMode ? (
                                            <>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Primary Diagnosis</label>
                                                    <input
                                                        type="text"
                                                        value={localDiagnosis}
                                                        onChange={(e) => setLocalDiagnosis(e.target.value)}
                                                        className="w-full border-b border-indigo-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                                                        placeholder="e.g. Acute Pharyngitis"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Clinical Notes</label>
                                                    <textarea
                                                        value={localNotes}
                                                        onChange={(e) => setLocalNotes(e.target.value)}
                                                        rows={6}
                                                        className="w-full border rounded-lg border-indigo-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                                                        placeholder="Patient presents with..."
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Primary Diagnosis</label>
                                                    <p className="text-slate-800 font-bold text-lg">{currentActive.diagnosis || 'Pending...'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Clinical Notes</label>
                                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[150px]">
                                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                                            {currentActive.notes || 'No notes recorded.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </div>

                                {/* Prescriptions */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 flex items-center">
                                            <Pill className="w-5 h-5 mr-2 text-emerald-600" />
                                            Prescriptions
                                        </h3>
                                        <button
                                            onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                                            className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-100 transition flex items-center border border-emerald-100"
                                        >
                                            {showPrescriptionForm ? 'Cancel' : '+ Add New'}
                                        </button>
                                    </div>
                                    <div className="p-0 border-b border-slate-100 divide-y max-h-[400px] overflow-y-auto">
                                        {currentActive.prescriptions?.map(p => (
                                            <div key={p.id} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition border-l-4 border-emerald-400">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{p.medication_name} <span className="text-emerald-600 text-xs font-normal ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">{p.dosage}</span></h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{p.frequency} • {p.duration}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!currentActive.prescriptions || currentActive.prescriptions.length === 0) && !showPrescriptionForm && (
                                            <div className="p-10 text-center text-slate-400 text-sm italic">
                                                No medications prescribed yet.
                                            </div>
                                        )}
                                    </div>
                                    {showPrescriptionForm && (
                                        <form action={async (formData) => {
                                            setIsProcessing(true)
                                            setToast(null)
                                            try {
                                                formData.append('consultation_id', currentActive.id)
                                                await addPrescription(formData)
                                                setShowPrescriptionForm(false)
                                                router.refresh()
                                            } catch (e: any) {
                                                console.error("Prescription Error:", e)
                                                setToast({
                                                    type: 'error',
                                                    message: `Failed to add prescription: ${e.message || 'Unknown error'}`
                                                })
                                            } finally {
                                                setIsProcessing(false)
                                            }
                                        }} className="p-4 bg-slate-50 space-y-3">
                                            <div>
                                                <input required name="medication_name" placeholder="Medication Name (e.g. Amoxicillin)" className="w-full text-sm p-2 rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required name="dosage" placeholder="Dosage (e.g. 500mg)" className="w-full text-sm p-2 rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                                <input required name="frequency" placeholder="Frequency (e.g. 2x daily)" className="w-full text-sm p-2 rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <div>
                                                <input required name="duration" placeholder="Duration (e.g. 7 days)" className="w-full text-sm p-2 rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                            </div>
                                            <button type="submit" disabled={isProcessing} className="w-full bg-slate-800 text-white text-sm font-semibold py-2 rounded hover:bg-slate-700 transition disabled:opacity-50">Save Prescription</button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 h-full text-slate-500">
                            <Stethoscope className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">No Active Consultations</h3>
                            <p className="mt-2 text-center max-w-sm">Select &apos;Attend to Patient&apos; from the live queue to begin.</p>
                        </div>
                    )}

                </div>
            </div>
            <PatientHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                patient={currentActive?.patient || null}
            />

            {/* Print Only Receipt - Hidden in Screen View */}
            {currentActive && (
                <div className="hidden print:block p-10 font-sans text-slate-900 border-2 border-slate-200 rounded-3xl">
                    <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-indigo-900 tracking-tight uppercase italic flex items-center">
                                <Activity className="w-10 h-10 mr-3 text-indigo-600" />
                                Medical Receipt
                            </h1>
                            <p className="text-slate-500 mt-2 font-bold tracking-widest text-sm underline decoration-indigo-200">Official Consultation Record</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-800">#{currentActive.id.split('-')[0].toUpperCase()}</p>
                            <p className="text-sm font-bold text-slate-400 mt-1">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-10">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Patient Information</h4>
                            <p className="text-2xl font-bold text-slate-800">{currentActive.patient.first_name} {currentActive.patient.last_name}</p>
                            <div className="mt-3 space-y-1 text-slate-500 font-medium">
                                <p>Gender: <span className="text-slate-800">{currentActive.patient.gender}</span></p>
                                <p>DOB: <span className="text-slate-800">{new Date(currentActive.patient.dob || '').toLocaleDateString()}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Consultation Details</h4>
                            <p className="text-xl font-bold text-slate-800">{currentActive.diagnosis}</p>
                            <p className="text-sm text-slate-500 mt-2 italic">&ldquo;{currentActive.notes?.substring(0, 100)}...&rdquo;</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b-2 border-indigo-100 pb-2">Prescribed Medications</h4>
                        <div className="space-y-4">
                            {currentActive.prescriptions?.map((p, idx) => (
                                <div key={p.id} className="flex justify-between items-center py-2 border-b border-dotted border-slate-200 last:border-0 px-2">
                                    <div>
                                        <p className="text-lg font-bold text-slate-800">{idx + 1}. {p.medication_name}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{p.dosage} • {p.frequency}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-300 uppercase italic">Duration</p>
                                        <p className="text-lg font-black text-indigo-600 italic leading-none">{p.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 flex justify-between items-end border-t-2 border-slate-100 pt-8">
                        <div className="text-xs text-slate-400 max-w-xs leading-relaxed font-bold uppercase tracking-wider">
                            Thank you for your visit. Please follow the prescribed medication schedule. This document serves as an official receipt.
                        </div>
                        <div className="text-right">
                            <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-[0.3em]">Attending Physician</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
