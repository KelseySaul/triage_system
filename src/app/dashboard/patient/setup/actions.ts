'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function setupPatientProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string
    const phone = formData.get('phone') as string
    const medical_history = formData.get('medical_history') as string

    // Split full name into first and last name for the patients table
    const nameParts = (profile?.full_name || 'Patient User').split(' ')
    const first_name = nameParts[0]
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    const data = {
        first_name,
        last_name,
        dob,
        gender,
        phone,
        medical_history,
        user_id: user.id
    }

    const { error } = await supabase.from('patients').insert([data])

    if (error) {
        throw new Error('Failed to create patient profile: ' + error.message)
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}
