import { redirect } from 'next/navigation'

export default function Custom404() {
    redirect('/not-found?reason=Page not found')
}

