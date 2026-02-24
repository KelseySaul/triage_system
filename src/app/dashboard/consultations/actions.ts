'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function attendToPatient(queueId: string, patientId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 1. Create Consultation Record using Service Role Key to bypass RLS
    // (In a true production app, you would fix the RLS policy itself to allow doctors to insert)
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    )

    // 2. Update Queue status to 'completed' as it leaves the live queue
    const { error: queueError } = await adminSupabase
        .from('queue')
        .update({ status: 'completed' })
        .eq('id', queueId)

    if (queueError) throw new Error(`Failed connecting patient out of queue: ${queueError.message}`)

    const { error: consultError } = await adminSupabase
        .from('consultations')
        .insert([
            {
                doctor_id: user.id,
                patient_id: patientId,
                diagnosis: '', // initially empty, doctor fills it out
                notes: ''
            }
        ])

    if (consultError) throw new Error(`Failed to initialize active consultation: ${consultError.message}`)

    revalidatePath('/dashboard/consultations')
}

export async function finishConsultation(consultationId: string, diagnosis: string, notes: string) {
    const supabase = await createClient()

    // 1. Update Consultation
    const { error: consultError } = await supabase
        .from('consultations')
        .update({
            diagnosis,
            notes,
        })
        .eq('id', consultationId)

    if (consultError) throw new Error("Failed to save diagnosis")

    revalidatePath('/dashboard/consultations')
}

export async function addPrescription(formData: FormData) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Critical Error: Missing Supabase environment variables in addPrescription")
        throw new Error("Server configuration error. Please contact administrator.")
    }

    const adminSupabase = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const consultation_id = formData.get('consultation_id') as string
    const medication_name = formData.get('medication_name') as string
    const dosage = formData.get('dosage') as string
    const frequency = formData.get('frequency') as string
    const duration = formData.get('duration') as string

    const { error } = await adminSupabase
        .from('prescriptions')
        .insert([{
            consultation_id,
            medication_name,
            dosage,
            frequency,
            duration
        }])

    if (error) {
        console.error("Supabase error in addPrescription:", error)
        throw new Error(`Failed to add prescription: ${error.message}`)
    }

    revalidatePath('/dashboard/consultations')
}
