'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string

    if (!supabaseUrl || !serviceRoleKey) {
        redirect('/signup?message=Server+Configuration+Error')
    }

    const authSupabase = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data: authData, error: authError } = await authSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name,
            role: 'patient'
        }
    })

    if (authError) {
        redirect('/signup?message=' + encodeURIComponent(authError.message))
    }

    if (authData?.user) {
        const { error: profileError } = await authSupabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                role: 'patient',
                full_name,
                is_active: true,
                email
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("Profile initialization error:", profileError)
            redirect('/signup?message=' + encodeURIComponent('Profile initialization failed'))
        }
    }

    // Sign them in
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) {
        redirect('/login?message=Account+created.+Please+log+in.')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
