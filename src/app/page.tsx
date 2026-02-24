import { redirect } from 'next/navigation'

export default function Home() {
  // Always redirect root to login or dashboard
  redirect('/login')
}
