import { signup } from './actions'
import { Hospital, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
    const searchParams = await props.searchParams
    const message = searchParams.message

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
            {/* Decorative background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/40 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-3xl"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10 z-10 relative overflow-hidden">
                {/* subtle glass shine */}
                <div className="absolute top-0 left-[-100%] w-[200%] h-32 bg-gradient-to-b from-white/60 to-transparent -rotate-12 pointer-events-none transform translate-y-[-50%]"></div>

                <div className="flex flex-col items-center mb-6 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-200 mb-6 transform hover:scale-105 transition duration-300">
                        <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">Patient Portal</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Create your account</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center relative z-10">
                        {message}
                    </div>
                )}

                <form action={signup} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                        <label htmlFor="full_name" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Full Name</label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition text-slate-900 text-sm font-medium placeholder-slate-400"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition text-slate-900 text-sm font-medium placeholder-slate-400"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition text-slate-900 text-sm font-medium placeholder-slate-400"
                            placeholder="••••••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-200 transform transition hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group mt-4!"
                    >
                        <span className="relative z-10">Sign Up</span>
                        <div className="absolute inset-0 h-full w-full scale-[2.0] bg-white/20 opacity-0 group-hover:opacity-100 transition duration-300 transform -translate-x-full group-hover:-translate-x-0 skew-x-12"></div>
                    </button>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-bold transition">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
