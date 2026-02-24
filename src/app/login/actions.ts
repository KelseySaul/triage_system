'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?message=Could not authenticate user')
    }

    // After successful login, redirect to a generic dashboard which will route based on role
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function forgotPassword() {
    // In a real app, this would send a reset email.
    // For now, we'll redirect with a message.
    redirect('/login?message=Please contact the system administrator to reset your password.')
}
