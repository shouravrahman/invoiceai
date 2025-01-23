import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
   auth,
   googleProvider,
   githubProvider,
   resetPassword,
   db
} from '../../lib/firebase';
import {
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   signInWithPopup,
   AuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
   LogIn,
   UserPlus,
   Loader2,
   Mail,
   Lock,
   Github,
   Chrome,
   AlertCircle
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'sonner';

type FormData = {
   email: string;
   password: string;
};

export function AuthForm() {
   const [isLogin, setIsLogin] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [resetEmail, setResetEmail] = useState('');
   const [showResetForm, setShowResetForm] = useState(false);
   const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
   const navigate = useNavigate();
   const [user] = useAuthState(auth);

   useEffect(() => {
      if (user) {
         checkUserProfile();
      }
   }, [user]);

   const checkUserProfile = async () => {
      if (!user) return;

      try {
         const userDoc = await getDoc(doc(db, 'users', user.uid));
         if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.hasCompletedProfile) {
               navigate('/documents');
               toast.success('Welcome back!');
            } else {
               navigate('/profile');
               toast.info('Please complete your profile');
            }
         } else {
            // If somehow the user document doesn't exist, create it
            await setDoc(doc(db, 'users', user.uid), {
               email: user.email,
               createdAt: new Date().toISOString(),
               plan: 'free',
               role: 'user',
               hasCompletedProfile: false
            });
            navigate('/profile');
            toast.info('Please complete your profile');
         }
      } catch (error) {
         console.error('Error checking profile:', error);
         toast.error('Error checking user profile');
      }
   };

   const handleSocialLogin = async (provider: AuthProvider) => {
      try {
         setIsSubmitting(true);
         const result = await signInWithPopup(auth, provider);
         const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

         if (isNewUser) {
            await setDoc(doc(db, 'users', result.user.uid), {
               email: result.user.email,
               createdAt: new Date().toISOString(),
               plan: 'free',
               role: 'user',
               hasCompletedProfile: false
            });
         }

         toast.success('Successfully signed in!');
      } catch (error: any) {
         console.error('Social auth error:', error);
         toast.error(error.message || 'Authentication failed');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handlePasswordReset = async () => {
      if (!resetEmail) {
         toast.error('Please enter your email address');
         return;
      }

      try {
         await resetPassword(resetEmail);
         toast.success('Password reset email sent!');
         setShowResetForm(false);
      } catch (error: any) {
         console.error('Password reset error:', error);
         toast.error(error.message || 'Failed to send reset email');
      }
   };

   const onSubmit = async (data: FormData) => {
      try {
         setIsSubmitting(true);
         if (isLogin) {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast.success('Successfully signed in!');
         } else {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
               email: data.email,
               createdAt: new Date().toISOString(),
               plan: 'free',
               role: 'user',
               hasCompletedProfile: false
            });
            toast.success('Account created successfully!');
         }
      } catch (error: any) {
         console.error('Authentication error:', error);
         toast.error(error.message || 'Authentication failed', {
            icon: <AlertCircle className="h-5 w-5 text-red-500" />
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
         <div className="card max-w-md w-full space-y-8 p-8">
            <div className="text-center">
               <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {showResetForm ? 'Reset Password' : isLogin ? 'Welcome back!' : 'Create your account'}
               </h2>
               <p className="mt-3 text-lg text-gray-500">
                  {showResetForm ? 'Enter your email to receive a reset link' :
                     isLogin ? 'Sign in to your account' : 'Start your journey with us'}
               </p>
            </div>

            {showResetForm ? (
               <div className="space-y-6">
                  <div>
                     <label htmlFor="reset-email" className="form-label">Email address</label>
                     <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                           id="reset-email"
                           type="email"
                           value={resetEmail}
                           onChange={(e) => setResetEmail(e.target.value)}
                           className="form-input pl-10"
                           placeholder="you@example.com"
                        />
                     </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                     <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="btn-primary"
                     >
                        Send Reset Link
                     </button>
                     <button
                        type="button"
                        onClick={() => setShowResetForm(false)}
                        className="btn-secondary"
                     >
                        Back to sign in
                     </button>
                  </div>
               </div>
            ) : (
               <>
                  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                     <div className="space-y-4">
                        <div>
                           <label htmlFor="email" className="form-label">Email address</label>
                           <div className="mt-1 relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                 {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                       value: /^\S+@\S+$/i,
                                       message: 'Please enter a valid email'
                                    }
                                 })}
                                 type="email"
                                 className="form-input pl-10"
                                 placeholder="you@example.com"
                              />
                           </div>
                           {errors.email && (
                              <p className="form-error">{errors.email.message}</p>
                           )}
                        </div>

                        <div>
                           <label htmlFor="password" className="form-label">Password</label>
                           <div className="mt-1 relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                 {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                       value: 6,
                                       message: 'Password must be at least 6 characters'
                                    }
                                 })}
                                 type="password"
                                 className="form-input pl-10"
                                 placeholder="••••••••"
                              />
                           </div>
                           {errors.password && (
                              <p className="form-error">{errors.password.message}</p>
                           )}
                        </div>
                     </div>

                     {isLogin && (
                        <div className="flex items-center justify-end">
                           <button
                              type="button"
                              onClick={() => setShowResetForm(true)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                           >
                              Forgot your password?
                           </button>
                        </div>
                     )}

                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full"
                     >
                        {isSubmitting ? (
                           <Loader2 className="animate-spin h-5 w-5" />
                        ) : isLogin ? (
                           <>
                              <LogIn className="h-5 w-5 mr-2" />
                              Sign in
                           </>
                        ) : (
                           <>
                              <UserPlus className="h-5 w-5 mr-2" />
                              Sign up
                           </>
                        )}
                     </button>
                  </form>

                  <div>
                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                           <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                           <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                     </div>

                     <div className="mt-6 grid grid-cols-2 gap-4">
                        <button
                           onClick={() => handleSocialLogin(googleProvider)}
                           disabled={isSubmitting}
                           className="btn-secondary"
                        >
                           <Chrome className="h-5 w-5 text-gray-400 mr-2" />
                           Google
                        </button>

                        <button
                           onClick={() => handleSocialLogin(githubProvider)}
                           disabled={isSubmitting}
                           className="btn-secondary"
                        >
                           <Github className="h-5 w-5 text-gray-400 mr-2" />
                           GitHub
                        </button>
                     </div>
                  </div>

                  <div className="text-center">
                     <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                     >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
