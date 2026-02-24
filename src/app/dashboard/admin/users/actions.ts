'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

    if (error) throw new Error("Failed to update user status")

    revalidatePath('/dashboard/admin/users')
}

export async function terminateUser(userId: string) {
    const supabase = await createClient()

    // We delete the profile which soft-terminates them from the app.
    // Full termination from auth.users requires the Supabase Admin API.
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (error) throw new Error("Failed to terminate user")

    revalidatePath('/dashboard/admin/users')
}

export async function addUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string

    // 1. Create an admin client using the Service Role Key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase Admin configuration (URL or Service Role Key)")
        throw new Error("Server configuration error: Admin keys missing.")
    }

    const authSupabase = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )

    // 2. Create the user in Auth
    const { data, error } = await authSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name,
            role
        }
    })

    if (error) {
        console.error("Supabase Auth Admin Error:", error.message)
        throw new Error(`Failed to create user: ${error.message}`)
    }

    try {
        // 3. Create/Update the profile using the SAME admin client to bypass RLS
        if (data?.user) {
            const { error: profileError } = await authSupabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    role,
                    full_name,
                    is_active: true,
                    email
                }, { onConflict: 'id' })

            if (profileError) {
                console.error("Supabase Profile Upsert Error (Admin):", profileError.message)
                throw new Error(`User created but profile initialization failed: ${profileError.message}`)
            }
        }
    } catch (err: any) {
        console.error("Unexpected error in addUser action:", err)
        throw new Error(err.message || "An unexpected server error occurred.")
    }

    revalidatePath('/dashboard/admin/users')
}
