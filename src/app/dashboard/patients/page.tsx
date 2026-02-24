import { createClient } from '@/utils/supabase/server'
import PatientsClient from './PatientsClient'

export default async function PatientsPage() {
    const supabase = await createClient()

    // Real fetch implementation connecting to public.patients
    const { data: patients, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false })

    return <PatientsClient initialPatients={patients} />
}
