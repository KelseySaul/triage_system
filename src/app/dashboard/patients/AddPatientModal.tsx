'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createPatient } from './actions'

export default function AddPatientModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            await createPatient(formData)
            onClose()
        } catch (error) {
            console.error(error)
            alert("Failed to add patient")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Register New Patient</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="first_name" className="text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="last_name" className="text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="dob" className="text-sm font-medium text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="gender" className="text-sm font-medium text-slate-700">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="medical_history" className="text-sm font-medium text-slate-700">Medical History</label>
                        <textarea
                            id="medical_history"
                            name="medical_history"
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="Allergies, chronic conditions, past surgeries..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition disabled:opacity-50 flex items-center"
                        >
                            {isSubmitting ? 'Registering...' : 'Register Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
