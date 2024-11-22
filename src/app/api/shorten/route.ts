import { NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { z } from 'zod'
import { db } from '@/lib/firebase-admin'
import QRCode from 'qrcode'
import bcrypt from 'bcrypt'
import sharp from 'sharp'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)

const shortenSchema = z.object({
    url: z.string().url(),
    customSlug: z.string().optional(),
    expirationOption: z.enum(['never', 'clicks', 'time']),
    expirationValue: z.string().optional(),
    password: z.string().optional(),
    isOneTimeUse: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    isDynamicLink: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    dynamicLinkOptions: z.preprocess(
        (val) => typeof val === 'string' ? JSON.parse(val) : val,
        z.object({
            day: z.string().url().optional(),
            night: z.string().url().optional(),
        })
    ).optional(),
    isAppStoreLink: z.preprocess((val) => val === 'true', z.boolean()).optional(),
    appStoreLinks: z.preprocess(
        (val) => typeof val === 'string' ? JSON.parse(val) : val,
        z.object({
            ios: z.string().url().optional(),
            android: z.string().url().optional(),
        })
    ).optional(),
    qrCodeColor: z.string().optional(),
    customLogo: z.any().optional(),
})

const batchShortenSchema = z.array(
    z.object({
        url: z.string().url(),
        customSlug: z.string().optional(),
    })
)

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type')
        let body;

        if (contentType === 'application/json') {
            body = await req.json()
            if (Array.isArray(body)) {
                // Batch processing
                const batchData = batchShortenSchema.parse(body)
                const results = await Promise.all(batchData.map(item => shortenUrl(item.url, item.customSlug)))
                return NextResponse.json(results)
            }
            body = shortenSchema.parse(body)
        } else {
            const formData = await req.formData()
            body = shortenSchema.parse(Object.fromEntries(formData))
        }

        const result = await shortenUrl(body.url, body.customSlug, body)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error shortening URL:', error)
        return NextResponse.json({ error: 'Error shortening URL' }, { status: 500 })
    }
}

interface AdditionalData {
    expirationOption?: 'never' | 'clicks' | 'time';
    expirationValue?: string;
    password?: string;
    isOneTimeUse?: boolean;
    isDynamicLink?: boolean;
    dynamicLinkOptions?: {
        day?: string;
        night?: string;
    };
    isAppStoreLink?: boolean;
    appStoreLinks?: {
        ios?: string;
        android?: string;
    };
    qrCodeColor?: string;
    customLogo?: Blob;
}

async function shortenUrl(url: string, customSlug?: string, additionalData?: AdditionalData) {
    const slug = customSlug || nanoid()

    // Check if slug already exists
    const slugDoc = await db.collection('urls').doc(slug).get()
    if (slugDoc.exists) {
        throw new Error('Custom slug already exists')
    }

    // Validate slug
    const slugRegex = /^[\p{L}\p{N}\p{Emoji}_-]+$/u
    if (customSlug && !slugRegex.test(customSlug)) {
        throw new Error('Invalid custom slug')
    }

    interface UrlData {
        originalUrl: string;
        createdAt: Date;
        expirationOption: 'never' | 'clicks' | 'time';
        isOneTimeUse: boolean;
        clicksRemaining?: number;
        expiresAt?: Date;
        password?: string;
        isDynamicLink?: boolean;
        dynamicLinkOptions?: {
            day: string;
            night: string;
        };
        isAppStoreLink?: boolean;
        appStoreLinks?: {
            ios?: string;
            android?: string;
        };
    }

    const urlData: UrlData = {
        originalUrl: url,
        createdAt: new Date(),
        expirationOption: additionalData?.expirationOption || 'never',
        isOneTimeUse: additionalData?.isOneTimeUse || false,
    }

    if (additionalData) {
        if (additionalData.expirationOption === 'clicks') {
            urlData.clicksRemaining = parseInt(additionalData.expirationValue || '1', 10)
        } else if (additionalData.expirationOption === 'time') {
            urlData.expiresAt = new Date(additionalData.expirationValue || '')
        }

        if (additionalData.password) {
            urlData.password = await bcrypt.hash(additionalData.password, 10)
        }

        if (additionalData.isDynamicLink && additionalData.dynamicLinkOptions) {
            urlData.isDynamicLink = true
            urlData.dynamicLinkOptions = {
                day: additionalData.dynamicLinkOptions.day || '',
                night: additionalData.dynamicLinkOptions.night || ''
            }
        }

        if (additionalData.isAppStoreLink && additionalData.appStoreLinks) {
            urlData.isAppStoreLink = true
            urlData.appStoreLinks = additionalData.appStoreLinks
        }
    }

    await db.collection('urls').doc(slug).set(urlData)

    const shortUrl = `https://flyra.link/${slug}`

    // Generate QR code
    const qrCodeOptions: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'H' as const,
        type: 'image/png',
        margin: 1,
        color: {
            dark: additionalData?.qrCodeColor || '#000000',
            light: '#FFFFFF',
        },
    }

    let qrCode = await QRCode.toDataURL(shortUrl, qrCodeOptions)

    // Add custom logo to QR code if provided
    if (additionalData?.customLogo) {
        const logoBuffer = await additionalData.customLogo.arrayBuffer()
        const qrCodeBuffer = Buffer.from(qrCode.split(',')[1], 'base64')

        const qrSize = 1000 // Adjust as needed
        const logoSize = Math.round(qrSize * 0.2) // Logo size is 20% of QR code size

        const qrWithLogo = await sharp(qrCodeBuffer)
            .resize(qrSize, qrSize)
            .composite([
                {
                    input: await sharp(Buffer.from(logoBuffer))
                        .resize(logoSize, logoSize)
                        .toBuffer(),
                    gravity: 'center',
                },
            ])
            .toBuffer()

        qrCode = `data:image/png;base64,${qrWithLogo.toString('base64')}`
    }

    return { shortUrl, qrCode }
}

