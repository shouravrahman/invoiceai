import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { createCheckout } from '../../lib/lemonsqueezy';
import { Check, Loader2 } from 'lucide-react';

export function SubscriptionPlans() {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!auth.currentUser) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const checkoutUrl = await createCheckout(
        auth.currentUser.uid,
        auth.currentUser.email || ''
      );
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-4 text-lg text-gray-600">
          Get started with our flexible pricing plans
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-900">Free Plan</h3>
            <p className="mt-4 text-gray-500">Perfect for getting started</p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </p>
          </div>
          <div className="px-6 pt-6 pb-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">5 documents per day</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">Basic templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">2,000 tokens per generation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200 border-2 border-indigo-500">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-900">Pro Plan</h3>
            <p className="mt-4 text-gray-500">For power users and businesses</p>
            <p className="mt-8">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-gray-500">/month</span>
            </p>
          </div>
          <div className="px-6 pt-6 pb-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">Unlimited documents</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">Premium templates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">4,000 tokens per generation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="ml-3 text-gray-500">Custom branding</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}