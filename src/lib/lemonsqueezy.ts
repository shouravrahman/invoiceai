import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const LEMONSQUEEZY_API_KEY = import.meta.env.VITE_LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = import.meta.env.VITE_LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_VARIANT_ID = import.meta.env.VITE_LEMONSQUEEZY_VARIANT_ID;

interface SubscriptionData {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: string;
  plan: 'free' | 'pro';
}

export async function createCheckout(userId: string, email: string): Promise<string> {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            store_id: LEMONSQUEEZY_STORE_ID,
            variant_id: LEMONSQUEEZY_VARIANT_ID,
            custom_data: { userId },
            customer_email: email,
            success_url: `${window.location.origin}/subscription/success`,
            cancel_url: `${window.location.origin}/subscription/cancel`
          }
        }
      })
    });

    const data = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw new Error('Failed to create checkout session');
  }
}

export async function handleSubscriptionWebhook(event: any) {
  const { data } = event;
  const userId = data.meta.custom_data.userId;

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const subscriptionData: SubscriptionData = {
      id: data.id,
      status: data.attributes.status,
      currentPeriodEnd: data.attributes.ends_at,
      plan: 'pro'
    };

    await updateDoc(userRef, {
      subscription: subscriptionData,
      plan: subscriptionData.status === 'active' ? 'pro' : 'free'
    });
  } catch (error) {
    console.error('Error handling subscription webhook:', error);
    throw error;
  }
}