'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculatePriority } from '@/utils/triage'

export async function createTriageRecord(formData: FormData) {
    const supabase = await createClient()

    // Get current nurse ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const patient_id = formData.get('patient_id') as string

    const bpSys = Number(formData.get('bp_sys'))
    const diastolicBp = Number(formData.get('diastolic_bp'))
    const heartRate = Number(formData.get('heart_rate'))
    const temperature = Number(formData.get('temperature'))
    const spo2 = Number(formData.get('spo2'))

    if (!patient_id || !Number.isFinite(bpSys) || !Number.isFinite(diastolicBp) || !Number.isFinite(heartRate) || !Number.isFinite(temperature) || !Number.isFinite(spo2)) {
        throw new Error('Invalid triage data')
    }

    const computedPriority = calculatePriority({
        systolicBp: bpSys,
        heartRate,
        temperature,
        spo2
    })

    // 1. Create the Triage Record
    const triageData = {
        patient_id,
        nurse_id: user.id,
        bp_sys: bpSys,
        diastolic_bp: diastolicBp,
        heart_rate: heartRate,
        temperature,
        spo2,
        symptoms: formData.get('symptoms') as string,
        priority_level: computedPriority,
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
