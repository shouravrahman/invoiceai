import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

interface UsageStats {
  dailyCount: number;
  monthlyCount: number;
  lastReset: string;
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    // Get user's plan and usage stats
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;

    const user = userDoc.data();
    const plan = user.plan || 'free';

    // Get rate limit configuration
    const configDoc = await getDoc(doc(db, 'config', 'rateLimits'));
    if (!configDoc.exists()) return false;

    const config = configDoc.data();
    const limits = config[`${plan}Plan`];

    // Get user's usage stats
    const statsDoc = await getDoc(doc(db, 'usage', userId));
    let stats: UsageStats = statsDoc.exists() 
      ? statsDoc.data() as UsageStats
      : { dailyCount: 0, monthlyCount: 0, lastReset: new Date().toISOString() };

    // Check if we need to reset counters
    const now = new Date();
    const lastReset = new Date(stats.lastReset);

    // Reset daily count if it's a new day
    if (now.getDate() !== lastReset.getDate()) {
      stats.dailyCount = 0;
    }

    // Reset monthly count if it's a new month
    if (now.getMonth() !== lastReset.getMonth()) {
      stats.monthlyCount = 0;
    }

    // Check if user has exceeded limits
    if (stats.dailyCount >= limits.dailyLimit || 
        stats.monthlyCount >= limits.monthlyLimit) {
      return false;
    }

    // Update usage stats
    await updateDoc(doc(db, 'usage', userId), {
      dailyCount: increment(1),
      monthlyCount: increment(1),
      lastReset: now.toISOString(),
      lastActive: now.toISOString()
    });

    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
}