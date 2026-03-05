'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Activity, ClipboardList, Users, Stethoscope, ShieldCheck, LogOut } from 'lucide-react'

type MobileNavProps = {
    role: string
    profile: any
    userEmail?: string
}

export function MobileNav({ role, profile, userEmail }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="md:hidden">
            {/* Mobile Header Bar */}
            <div className="bg-indigo-900 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center space-x-2">
                    <Activity className="w-7 h-7 text-indigo-300" />
                    <span className="text-lg font-bold tracking-tight">Triage System</span>
                </div>
                <button
                    onClick={toggleMenu}
                    className="p-2 text-indigo-100 hover:bg-white/10 rounded-lg transition"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[51]"
                        onClick={toggleMenu}
                    />
                    <div className="fixed inset-y-0 right-0 w-72 bg-indigo-900 text-white z-[52] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                        <div className="p-6 flex items-center justify-between border-b border-indigo-800">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-6 h-6 text-indigo-300" />
                                <span className="font-bold">Navigation</span>
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="p-2 text-indigo-300 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            <Link
                                href="/dashboard"
                                onClick={toggleMenu}
                                className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                            >
                                <ClipboardList className="w-5 h-5 text-indigo-300" />
                                <span className="font-medium">Overview</span>
                            </Link>

                            {(role === 'receptionist' || role === 'admin') && (
                                <>
                                    <Link
                                        href="/dashboard/patients"
                                        onClick={toggleMenu}
                                        className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <Users className="w-5 h-5 text-indigo-300" />
                                        <span className="font-medium">Patients</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/receptionist/queue"
                                        onClick={toggleMenu}
                                        className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                    >
                                        <Activity className="w-5 h-5 text-indigo-300" />
                                        <span className="font-medium">Live Queue</span>
                                    </Link>
                                </>
                            )}

                            {(role === 'nurse' || role === 'admin') && (
                                <Link
                                    href="/dashboard/triage"
                                    onClick={toggleMenu}
                                    className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                >
                                    <Activity className="w-5 h-5 text-indigo-300" />
                                    <span className="font-medium">Triage Queue</span>
                                </Link>
                            )}

                            {(role === 'doctor' || role === 'admin') && (
                                <Link
                                    href="/dashboard/consultations"
                                    onClick={toggleMenu}
                                    className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                >
                                    <Stethoscope className="w-5 h-5 text-indigo-300" />
                                    <span className="font-medium">Consultations</span>
                                </Link>
                            )}

                            {role === 'admin' && (
                                <Link
                                    href="/dashboard/admin/users"
                                    onClick={toggleMenu}
                                    className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition"
                                >
                                    <ShieldCheck className="w-5 h-5 text-indigo-300" />
                                    <span className="font-medium">User Access</span>
                                </Link>
                            )}
                        </nav>

                        <div className="p-6 border-t border-indigo-800 bg-indigo-950/50">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-inner">
                                    {profile?.full_name?.charAt(0) || userEmail?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold truncate text-white">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-indigo-300 truncate capitalize font-medium">{role}</p>
                                </div>
                            </div>
                            <form action="/auth/signout" method="post">
                                <button className="flex w-full items-center justify-center space-x-3 px-4 py-3 bg-indigo-800 hover:bg-indigo-700 text-sm font-bold rounded-xl transition shadow-sm">
                                    <LogOut className="w-4 h-4" />
                                    <span>Log out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
