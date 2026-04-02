'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookAppointment(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Get the patient record ID
    const { data: patientRecord } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!patientRecord) {
        throw new Error("Patient record not found. Please complete your profile first.")
    }

    const appointment_date = formData.get('appointment_date') as string
    const appointment_time = formData.get('appointment_time') as string
    const reason = formData.get('reason') as string

    if (!appointment_date || !appointment_time) {
        throw new Error("Date and time are required.")
    }

    const { error } = await supabase
        .from('appointments')
        .insert([{
            patient_id: patientRecord.id,
            appointment_date,
            appointment_time,
            reason: reason || '',
            status: 'pending'
        }])

    if (error) {
        throw new Error("Failed to book appointment: " + error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/patient/appointments')
}
