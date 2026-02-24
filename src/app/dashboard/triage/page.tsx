import { createClient } from '@/utils/supabase/server'
import TriageClient from './TriageClient'

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
  const mappedRecords = recordsData?.map((q: any) => {
    const triageData = Array.isArray(q.triage_records) ? q.triage_records[0] : (q.triage_records || {})
    return {
      ...triageData,
      id: q.id, // Ensure the parent queue ID is passed to match Doctor actions if needed
      patient: Array.isArray(q.patients) ? q.patients[0] : (q.patients || {})
    }
  }) || []

  // Fetch all patients for the patient selection modal
  const { data: patientsData } = await supabase.from('patients').select('id, first_name, last_name, dob')

  return <TriageClient initialRecords={mappedRecords} patients={patientsData} />
}
