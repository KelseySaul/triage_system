'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, UserPlus, MoreVertical, Ban, CheckCircle, Trash2, X } from 'lucide-react'
import { addUser, toggleUserStatus, terminateUser } from './actions'

type Profile = {
    id: string
    full_name: string
    role: string
    email: string
    created_at: string
    is_active: boolean
}

export default function AdminUsersClient({ profiles }: { profiles: Profile[] }) {
    const router = useRouter()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null)

    const handleAddUser = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            await addUser(formData)
            setIsAddModalOpen(false)
            router.refresh()
            alert("User successfully created and added to the directory.")
        } catch (e: any) {
            console.error("Add User UI Error:", e)
            alert(`Failed to add user: ${e.message || 'Please check server logs.'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (user: Profile) => {
        if (!confirm(`Are you sure you want to ${user.is_active ? 'suspend' : 'reactivate'} ${user.full_name}?`)) return
        setIsSubmitting(true)
        try {
            await toggleUserStatus(user.id, user.is_active)
            setActionMenuOpenId(null)
            router.refresh()
        } catch {
            alert("Failed to update status")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleTerminate = async (user: Profile) => {
        if (!confirm(`Are you absolutely sure you want to permanently terminate ${user.full_name}'s account? This action cannot be undone.`)) return
        setIsSubmitting(true)
        try {
            await terminateUser(user.id)
            setActionMenuOpenId(null)
            router.refresh()
        } catch {
            alert("Failed to terminate user")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage staff accounts, roles, and system access.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-md shadow-indigo-200 flex items-center space-x-2"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add New User</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible relative">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-white border-b border-slate-200 text-slate-800 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 relative">
                            {profiles?.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${p.is_active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {p.full_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className={`font-medium ${p.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                                                    {p.full_name || 'Unnamed User'}
                                                </div>
                                                <div className="text-xs text-slate-500">{p.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                          ${p.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                                p.role === 'doctor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    p.role === 'nurse' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        'bg-slate-50 text-slate-700 border border-slate-200'}`}
                                        >
                                            {p.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.is_active ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                                                Suspended
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => setActionMenuOpenId(actionMenuOpenId === p.id ? null : p.id)}
                                            className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Action Dropdown Menu */}
                                        {actionMenuOpenId === p.id && (
                                            <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden text-left">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleToggleStatus(p)}
                                                        disabled={isSubmitting}
                                                        className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                                    >
                                                        {p.is_active ? (
                                                            <><Ban className="w-4 h-4 text-amber-500" /><span>Suspend Account</span></>
                                                        ) : (
                                                            <><CheckCircle className="w-4 h-4 text-emerald-500" /><span>Reactivate Account</span></>
                                                        )}
                                                    </button>

                                                    {p.role !== 'admin' && ( // Prevent deleting other admins to avoid lockout
                                                        <button
                                                            onClick={() => handleTerminate(p)}
                                                            disabled={isSubmitting}
                                                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-100 mt-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" /><span>Terminate Account</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {(!profiles || profiles.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                        <p>No user profiles found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add New User</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form action={handleAddUser} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    name="full_name"
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Dr. Jane Doe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="doctor@example.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Temporary Password</label>
                                <input
                                    name="password"
                                    type="text"
                                    required
                                    minLength={6}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="********"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    name="role"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="doctor">Doctor</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Adding User...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
