'use client'

import { useState } from 'react'
import { Plus, Search, User, Phone, Calendar, Eye, Edit2 } from 'lucide-react'
import AddPatientModal from './AddPatientModal'
import EditPatientModal from './EditPatientModal'
import ViewPatientModal from './ViewPatientModal'

type Patient = {
    id: string
    first_name: string
    last_name: string
    dob: string
    gender: string
    phone: string
    medical_history: string
    created_at: string
}

export default function PatientsClient({ initialPatients }: { initialPatients: Patient[] | null }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const patients = initialPatients?.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.includes(searchQuery)
    )

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Patients</h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered patients.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-md shadow-indigo-200 flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Patient</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search patients by name or ID..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-white border-b border-slate-200 text-slate-800 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">DOB</th>
                                <th className="px-6 py-4">Gender</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients?.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {patient.first_name?.[0]}{patient.last_name?.[0]}
                                            </div>
                                            <div className="font-medium text-slate-800">
                                                {patient.first_name} {patient.last_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{new Date(patient.dob).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                            {patient.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span>{patient.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPatient(patient)
                                                setIsViewModalOpen(true)
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center space-x-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedPatient(patient)
                                                setIsEditModalOpen(true)
                                            }}
                                            className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center space-x-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {(!patients || patients.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p>{searchQuery ? 'No matching patients found.' : 'No patients found. Create one to get started.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedPatient(null)
                }}
                patient={selectedPatient}
            />
            <ViewPatientModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedPatient(null)
                }}
                patient={selectedPatient}
            />
        </div>
    )
}
