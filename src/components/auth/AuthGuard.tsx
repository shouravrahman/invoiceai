import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthGuardProps {
   children: React.ReactNode;
   requireAdmin?: boolean;
   requireVerified?: boolean;
}

export function AuthGuard({ children, requireAdmin = false, requireVerified = false }: AuthGuardProps) {
   const [user, loading] = useAuthState(auth);
   const [isAdmin, setIsAdmin] = useState(false);
   const [isChecking, setIsChecking] = useState(true);
   const navigate = useNavigate();
   const location = useLocation();

   useEffect(() => {
      const checkAuth = async () => {
         if (!user) {
            // Store the attempted URL
            sessionStorage.setItem('redirectUrl', location.pathname);
            navigate('/', { replace: true });
            return;
         }

         try {
            // Check email verification if required
            if (requireVerified && !user.emailVerified) {
               toast.error('Please verify your email address first');
               navigate('/', { replace: true });
               return;
            }

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            if (!userDoc.exists()) {
               toast.error('User profile not found');
               await auth.signOut();
               navigate('/', { replace: true });
               return;
            }

            if (requireAdmin && userData?.role !== 'admin') {
               toast.error('Access denied: Admin privileges required');
               navigate('/documents', { replace: true });
               return;
            }

            setIsAdmin(userData?.role === 'admin');
         } catch (error) {
            console.error('Error checking auth:', error);
            toast.error('Authentication error');
            navigate('/', { replace: true });
         } finally {
            setIsChecking(false);
         }
      };

      if (!loading) {
         checkAuth();
      }
   }, [user, loading, navigate, location.pathname, requireAdmin, requireVerified]);

   if (loading || isChecking) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
               <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
               <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
         </div>
      );
   }

   if (!user || (requireAdmin && !isAdmin) || (requireVerified && !user.emailVerified)) {
      return null;
   }

   return <>{children}</>;
}
