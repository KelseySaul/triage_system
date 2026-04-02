'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, newStatus: 'approved' | 'rejected' | 'completed' | 'cancelled') {
    const supabase = await createClient()

    // Optionally check if user is a receptionist or admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Verify role (fallback to metadata or default to receptionist for legacy/syncing profiles)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || user.user_metadata?.role || 'receptionist'

    if (role !== 'admin' && role !== 'receptionist') {
        throw new Error("Unauthorized access. Receptionist role required.")
    }

    const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

    if (error) {
        throw new Error("Failed to update appointment: " + error.message)
    }

    revalidatePath('/dashboard/receptionist/appointments')
}
