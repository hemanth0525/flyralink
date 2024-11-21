import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import bcrypt from 'bcrypt'

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
    const slug = context.params.slug
    const urlDoc = await db.collection('urls').doc(slug).get()

    if (!urlDoc.exists) {
        return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    const urlData = urlDoc.data()
    if (!urlData) {
        return NextResponse.json({ error: 'URL data not found' }, { status: 404 })
    }

    // Handle app store links
    if (urlData.isAppStoreLink) {
        const userAgent = req.headers.get('user-agent') || ''
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
        return NextResponse.redirect(isIOS ? urlData.appStoreLinks.ios : urlData.appStoreLinks.android)
    }

    return NextResponse.redirect(urlData.originalUrl)
}

export async function POST(req: NextRequest, context: { params: { slug: string } }) {
    const slug = context.params.slug
    const { password } = await req.json()
    const urlDoc = await db.collection('urls').doc(slug).get()

    if (!urlDoc.exists) {
        return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    const urlData = urlDoc.data()

    if (!urlData || !urlData.password) {
        return NextResponse.json({ error: 'URL is not password protected' }, { status: 400 })
    }

    const passwordMatch = await bcrypt.compare(password, urlData.password)

    if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    return NextResponse.json({ originalUrl: urlData.originalUrl })
}

