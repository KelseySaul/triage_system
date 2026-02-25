import { createClient } from '@/utils/supabase/server'
import ConsultationsClient from './ConsultationsClient'

type PriorityLevel = 'Emergency' | 'Urgent' | 'Normal'
const PRIORITY_ORDER: PriorityLevel[] = ['Emergency', 'Urgent', 'Normal']

export default async function ConsultationsPage() {
    const supabase = await createClient()

    // Verify Role and get provider ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8 text-center text-red-500 font-bold">Unauthorized</div>

    // 1. Fetch the Live Queue corresponding to 'waiting' status for Doctors to pick from
    const { data: waitingQueue } = await supabase
        .from('queue')
        .select(`
        id,
        joined_at,
        patients (
           id,
           first_name,
           last_name
        ),
        triage_records (
           priority_level,
           bp_sys,
           diastolic_bp,
           heart_rate,
           temperature
        )
    `)
        .eq('status', 'waiting')
        .order('joined_at', { ascending: true })

    const liveQueueMapped = (waitingQueue?.map((q: any) => ({
        id: q.id,
        joined_at: q.joined_at,
        patient: Array.isArray(q.patients) ? q.patients[0] : (q.patients || {}),
        triage: Array.isArray(q.triage_records) ? q.triage_records[0] : (q.triage_records || {})
    })) || []) as {
        id: string
        joined_at: string
        triage: { priority_level: PriorityLevel }
        [key: string]: any
    }[]

    // Sort by clinical priority first, then by time in queue
    const liveQueueSorted = liveQueueMapped.sort((a, b) => {
        const priorityDiff =
            PRIORITY_ORDER.indexOf(a.triage.priority_level) - PRIORITY_ORDER.indexOf(b.triage.priority_level)
        if (priorityDiff !== 0) return priorityDiff

        return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    })

    // 2. Fetch completed/active consultations for this doctor to show in history
    const { data: consultationsRaw } = await supabase
        .from('consultations')
        .select(`
       id,
       diagnosis,
       notes,
       created_at,
       patients (
          id,
          first_name,
          last_name,
          gender,
          dob
       ),
       prescriptions (*)
    `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

    const pastConsultationsMapped = consultationsRaw?.map((c: any) => ({
        id: c.id,
        diagnosis: c.diagnosis,
        notes: c.notes,
        created_at: c.created_at,
        patient: Array.isArray(c.patients) ? c.patients[0] : (c.patients || {}),
        prescriptions: c.prescriptions || []
    })) || []

    return <ConsultationsClient liveQueue={liveQueueSorted as any} pastConsultations={pastConsultationsMapped as any} />
}
