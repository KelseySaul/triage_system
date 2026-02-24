'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function fetchPatientHistory(patientId: string) {
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    )

    // 1. Fetch all their past consultations
    const { data: consultations, error: consultError } = await adminSupabase
        .from('consultations')
        .select(`
            id,
            diagnosis,
            notes,
            created_at,
            prescriptions (*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (consultError) throw new Error("Failed to fetch past consultations")

    // 2. Fetch all their past triage vitals
    const { data: vitals, error: vitalError } = await adminSupabase
        .from('triage_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (vitalError) throw new Error("Failed to fetch past vitals")

    return {
        consultations,
        vitals
    }
}
