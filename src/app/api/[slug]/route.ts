import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import bcrypt from 'bcrypt'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        // Await the params before accessing
        const { slug } = await context.params

        // Rest of your route logic here
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug parameter is required' },
                { status: 400 }
            )
        }

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
            const userAgent = request.headers.get('user-agent') || ''
            const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
            return NextResponse.redirect(isIOS ? urlData.appStoreLinks.ios : urlData.appStoreLinks.android)
        }

        return NextResponse.redirect(urlData.originalUrl)
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        // Await params
        const { slug } = await context.params
        
        // Get password from request body
        const { password } = await request.json()

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }

        // Get URL document
        const urlDoc = await db.collection('urls').doc(slug).get()

        if (!urlDoc.exists) {
            return NextResponse.json(
                { error: 'URL not found' },
                { status: 404 }
            )
        }

        const urlData = urlDoc.data()

        if (!urlData || !urlData.password) {
            return NextResponse.json(
                { error: 'URL is not password protected' },
                { status: 400 }
            )
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, urlData.password)

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Incorrect password' },
                { status: 401 }
            )
        }

        return NextResponse.json({ originalUrl: urlData.originalUrl })
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

