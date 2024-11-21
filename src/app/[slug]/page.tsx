import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/firebase-admin';
import { redis } from '@/lib/redis';
import PasswordProtectedForm from '@/components/PasswordProtectedForm';

export default async function SlugPage({ params }: { params: { slug: string } }) {
    const decodedSlug = decodeURIComponent(params.slug);

    // Check Redis cache
    let cachedUrlData = null;
    try {
        cachedUrlData = await redis.get(decodedSlug);
    } catch (error) {
        // If there's an error with Redis (e.g., rate limit exceeded), fallback to Firestore
        console.error('Error fetching from Redis, falling back to Firestore:', error);
    }

    if (cachedUrlData) {
        const urlData = typeof cachedUrlData === 'string' ? JSON.parse(cachedUrlData) : null;

        // Handle password-protected links
        if (urlData && urlData.password) {
            return <PasswordProtectedForm slug={decodedSlug} />;
        }

        // Handle dynamic links
        if (urlData && urlData.isDynamicLink) {
            const currentHour = new Date().getHours();
            const isDaytime = currentHour >= 6 && currentHour < 18;
            redirect(isDaytime ? urlData.dynamicLinkOptions.day : urlData.dynamicLinkOptions.night);
        }

        // Handle app store links
        if (urlData && urlData.isAppStoreLink) {
            redirect('/api/' + decodedSlug);
        }

        if (urlData && urlData.originalUrl) {
            redirect(urlData.originalUrl);
        }
    }

    // Fallback to Firestore if Redis is not available or cache miss
    const urlDoc = await db.collection('urls').doc(decodedSlug).get();
    if (!urlDoc.exists) {
        notFound();
    }

    const urlData = urlDoc.data();
    if (!urlData) {
        notFound();
    }

    // Check expiration (time-based)
    if (urlData.expirationOption === 'time' && urlData.expiresAt.toDate() < new Date()) {
        notFound();
    }

    // Check expiration (clicks-based)
    if (urlData.expirationOption === 'clicks') {
        if (urlData.clicksRemaining <= 0) {
            notFound();
        }
        await urlDoc.ref.update({ clicksRemaining: urlData.clicksRemaining - 1 });
    }

    // Handle one-time use links
    if (urlData.isOneTimeUse) {
        await urlDoc.ref.delete();
    }

    // Cache the URL data in Redis
    try {
        await redis.set(decodedSlug, JSON.stringify(urlData), {
            ex: 3600, // Cache for 1 hour
        });
    } catch (error) {
        console.error('Error caching in Redis:', error);
    }

    // Handle password-protected links
    if (urlData.password) {
        return <PasswordProtectedForm slug={decodedSlug} />;
    }

    // Handle dynamic links
    if (urlData.isDynamicLink) {
        const currentHour = new Date().getHours();
        const isDaytime = currentHour >= 6 && currentHour < 18;
        redirect(isDaytime ? urlData.dynamicLinkOptions.day : urlData.dynamicLinkOptions.night);
    }

    // Handle app store links
    if (urlData.isAppStoreLink) {
        redirect('/api/' + decodedSlug);
    }

    redirect(urlData.originalUrl);
}
