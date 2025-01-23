import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CreditCard, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface SubscriptionData {
  id: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: string;
  plan: 'free' | 'pro';
}

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().subscription) {
        setSubscription(userDoc.data().subscription as SubscriptionData);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!subscription) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">No Active Subscription</h2>
            <p className="mt-2 text-gray-600">
              You're currently on the free plan. Upgrade to access premium features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Subscription Details
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-gray-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Plan</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Renewal Date</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {subscription.status === 'active' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Status</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="https://app.lemonsqueezy.com/my-orders"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Manage Subscription
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}