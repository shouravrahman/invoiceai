import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';

interface RateLimitConfig {
   freePlan: {
      dailyLimit: number;
      monthlyLimit: number;
      maxTokens: number;
   };
   proPlan: {
      dailyLimit: number;
      monthlyLimit: number;
      maxTokens: number;
   };
}

export function RateLimits() {
   const [config, setConfig] = useState<RateLimitConfig>({
      freePlan: {
         dailyLimit: 5,
         monthlyLimit: 50,
         maxTokens: 2000
      },
      proPlan: {
         dailyLimit: 50,
         monthlyLimit: 1000,
         maxTokens: 4000
      }
   });
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      fetchConfig();
   }, []);

   const fetchConfig = async () => {
      try {
         const docRef = doc(db, 'config', 'rateLimits');
         const docSnap = await getDoc(docRef);
         if (docSnap.exists()) {
            setConfig(docSnap.data() as RateLimitConfig);
         }
      } catch (error) {
         console.error('Error fetching rate limits:', error);
      }
   };

   const handleSave = async () => {
      try {
         setSaving(true);
         await updateDoc(doc(db, 'config', 'rateLimits'), config);
      } catch (error) {
         console.error('Error saving rate limits:', error);
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="bg-white shadow rounded-lg">
         <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Rate Limits Configuration</h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               {/* Free Plan */}
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Free Plan Limits</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Generation Limit</label>
                        <input
                           type="number"
                           value={config.freePlan.dailyLimit}
                           onChange={(e) => setConfig({
                              ...config,
                              freePlan: { ...config.freePlan, dailyLimit: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Generation Limit</label>
                        <input
                           type="number"
                           value={config.freePlan.monthlyLimit}
                           onChange={(e) => setConfig({
                              ...config,
                              freePlan: { ...config.freePlan, monthlyLimit: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Max Tokens per Generation</label>
                        <input
                           type="number"
                           value={config.freePlan.maxTokens}
                           onChange={(e) => setConfig({
                              ...config,
                              freePlan: { ...config.freePlan, maxTokens: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                  </div>
               </div>

               {/* Pro Plan */}
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Pro Plan Limits</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Generation Limit</label>
                        <input
                           type="number"
                           value={config.proPlan.dailyLimit}
                           onChange={(e) => setConfig({
                              ...config,
                              proPlan: { ...config.proPlan, dailyLimit: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Generation Limit</label>
                        <input
                           type="number"
                           value={config.proPlan.monthlyLimit}
                           onChange={(e) => setConfig({
                              ...config,
                              proPlan: { ...config.proPlan, monthlyLimit: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Max Tokens per Generation</label>
                        <input
                           type="number"
                           value={config.proPlan.maxTokens}
                           onChange={(e) => setConfig({
                              ...config,
                              proPlan: { ...config.proPlan, maxTokens: parseInt(e.target.value) }
                           })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-6">
               <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
               >
                  {saving ? (
                     <>Saving...</>
                  ) : (
                     <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
