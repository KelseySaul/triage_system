import { createClient } from '@/utils/supabase/server'
import TriageClient from './TriageClient'

type PriorityLevel = 'Emergency' | 'Urgent' | 'Normal'

type TriageRecord = {
  id: string
  bp_sys: number
  diastolic_bp: number
  heart_rate: number
  temperature: number
  spo2: number
  symptoms: string
  priority_level: PriorityLevel
  created_at: string
  patient: {
    first_name: string
    last_name: string
  }
}

const PRIORITY_ORDER: PriorityLevel[] = ['Emergency', 'Urgent', 'Normal']

export default async function TriagePage() {
  const supabase = await createClient()

  // Fetch triage records that are in the queue and waiting
  const { data: recordsData } = await supabase
    .from('queue')
    .select(`
      id,
      status,
      triage_records (
        id,
        bp_sys,
        diastolic_bp,
        heart_rate,
        temperature,
        spo2,
        symptoms,
        priority_level,
        created_at
      ),
      patients (
        id,
        first_name,
        last_name
      )
    `)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })

  // Map the structured data to flatter representations for the client
  const mappedRecords: TriageRecord[] = (recordsData?.map((q: any) => {
    const triageData = Array.isArray(q.triage_records) ? q.triage_records[0] : (q.triage_records || {})
    return {
      ...triageData,
      id: q.id, // Ensure the parent queue ID is passed to match Doctor actions if needed
      patient: Array.isArray(q.patients) ? q.patients[0] : (q.patients || {})
    }
  }) || []) as TriageRecord[]

  // Sort by clinical priority first, then by time waiting
  const sortedRecords: TriageRecord[] = [...mappedRecords].sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER.indexOf(a.priority_level) - PRIORITY_ORDER.indexOf(b.priority_level)
    if (priorityDiff !== 0) return priorityDiff

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // Fetch all patients for the patient selection modal
  const { data: patientsData } = await supabase.from('patients').select('id, first_name, last_name, dob')

  return <TriageClient initialRecords={sortedRecords} patients={patientsData} />
}

