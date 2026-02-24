'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPatient(formData: FormData) {
    const supabase = await createClient()

    const data = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        dob: formData.get('dob') as string,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        medical_history: formData.get('medical_history') as string,
    }

    const { error } = await supabase.from('patients').insert([data])

    if (error) {
        throw new Error('Failed to create patient: ' + error.message)
    }

    revalidatePath('/dashboard/patients')
}

export async function updatePatient(patientId: string, formData: FormData) {
    const supabase = await createClient()

    const data = {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        dob: formData.get('dob') as string,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        medical_history: formData.get('medical_history') as string,
    }

    const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', patientId)

    if (error) {
        throw new Error('Failed to update patient: ' + error.message)
    }

    revalidatePath('/dashboard/patients')
}
