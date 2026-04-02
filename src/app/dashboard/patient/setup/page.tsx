import { setupPatientProfile } from './actions'
import { PageHeader } from '@/components/ui/PageHeader'
import { UserCircle, Calendar, Phone, FileText } from 'lucide-react'

export default function PatientSetupPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <PageHeader
                kicker="Getting Started"
                title="Complete Your Profile"
                subtitle="Please provide some basic medical information before booking your first appointment."
            />

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <form action={setupPatientProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="dob" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" /> Date of Birth
                            </label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="gender" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-indigo-500" /> Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm appearance-none"
                            >
                                <option value="">Select gender...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-indigo-500" /> Phone Number
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            placeholder="+254 700 000000"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="medical_history" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" /> Known Medical History / Allergies
                        </label>
                        <textarea
                            id="medical_history"
                            name="medical_history"
                            rows={4}
                            placeholder="Please list any major medical conditions, recent surgeries, or known allergies..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition text-sm resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Save Profile Information
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
