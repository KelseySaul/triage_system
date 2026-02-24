'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTriageRecord(formData: FormData) {
    const supabase = await createClient()

    // Get current nurse ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const patient_id = formData.get('patient_id') as string

    // 1. Create the Triage Record
    const triageData = {
        patient_id,
        nurse_id: user.id,
        bp_sys: parseInt(formData.get('bp_sys') as string),
        diastolic_bp: parseInt(formData.get('diastolic_bp') as string),
        heart_rate: parseInt(formData.get('heart_rate') as string),
        temperature: parseFloat(formData.get('temperature') as string),
        spo2: parseInt(formData.get('spo2') as string),
        symptoms: formData.get('symptoms') as string,
        priority_level: formData.get('priority_level') as string,
    }

    const { data: triageRecord, error: triageError } = await supabase
        .from('triage_records')
        .insert([triageData])
        .select()
        .single()

    if (triageError) {
        throw new Error('Failed to save triage record: ' + triageError.message)
    }

    // 2. Add patient to the queue
    const queueData = {
        patient_id,
        triage_id: triageRecord.id,
        status: 'waiting'
    }

    const { error: queueError } = await supabase
        .from('queue')
        .insert([queueData])

    if (queueError) {
        throw new Error('Failed to add to queue: ' + queueError.message)
    }

    revalidatePath('/dashboard/triage')
}
