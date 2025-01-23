import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UsageData {
  date: string;
  free: number;
  pro: number;
}

export function UsageStats() {
  const [dailyUsage, setDailyUsage] = useState<UsageData[]>([]);
  const [totalUsers, setTotalUsers] = useState({ free: 0, pro: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      // Fetch usage data
      const usageQuery = query(collection(db, 'usage'));
      const usageSnapshot = await getDocs(usageQuery);
      
      // Process usage data into daily stats
      const usageByDay = new Map<string, { free: number; pro: number }>();
      
      usageSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.lastReset).toLocaleDateString();
        
        if (!usageByDay.has(date)) {
          usageByDay.set(date, { free: 0, pro: 0 });
        }
        
        const stats = usageByDay.get(date)!;
        stats[data.plan === 'pro' ? 'pro' : 'free'] += data.dailyCount;
      });

      // Convert to array format for chart
      const chartData = Array.from(usageByDay.entries()).map(([date, stats]) => ({
        date,
        ...stats
      }));

      setDailyUsage(chartData);

      // Count total users by plan
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const userCounts = { free: 0, pro: 0 };
      usersSnapshot.docs.forEach(doc => {
        const user = doc.data();
        userCounts[user.plan === 'pro' ? 'pro' : 'free']++;
      });

      setTotalUsers(userCounts);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Usage Statistics</h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Free Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalUsers.free}</dd>
            </div>
          </div>
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Pro Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalUsers.pro}</dd>
            </div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="free" fill="#93c5fd" name="Free Plan Usage" />
              <Bar dataKey="pro" fill="#6366f1" name="Pro Plan Usage" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}