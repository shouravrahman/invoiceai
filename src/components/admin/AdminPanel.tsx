import { useState } from 'react';
import { Users, Activity, Shield } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { UsageStats } from './UsageStats';
import { RateLimits } from './RateLimits';

export function AdminPanel() {
   const [activeTab, setActiveTab] = useState('users');

   const tabs = [
      { id: 'users', name: 'User Management', icon: Users },
      { id: 'usage', name: 'Usage Statistics', icon: Activity },
      { id: 'limits', name: 'Rate Limits', icon: Shield },
   ];

   return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
            <aside className="py-6 px-2 sm:px-6 lg:col-span-3">
               <nav className="space-y-1">
                  {tabs.map((tab) => {
                     const Icon = tab.icon;
                     return (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`${activeTab === tab.id
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              } group w-full flex items-center px-3 py-2 text-sm font-medium border-l-4`}
                        >
                           <Icon
                              className={`${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'
                                 } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                           />
                           <span className="truncate">{tab.name}</span>
                        </button>
                     );
                  })}
               </nav>
            </aside>

            <div className="space-y-6 sm:px-6 lg:col-span-9">
               {activeTab === 'users' && <UserManagement />}
               {activeTab === 'usage' && <UsageStats />}
               {activeTab === 'limits' && <RateLimits />}
            </div>
         </div>
      </div>
   );
}
