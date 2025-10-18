import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Building2, Upload, Mail, Phone, Globe, MapPin, Briefcase, Receipt, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

type ProfileData = {
   companyName: string;
   address: string;
   phone: string;
   website: string;
   email: string;
   taxId: string;
   industry: string;
   paymentTerms: string;
   bankDetails: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      swiftCode: string;
  };
   billingAddress: string;
   defaultCurrency: string;
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
const INDUSTRIES = [
   'Technology',
   'Consulting',
   'Healthcare',
   'Finance',
   'Education',
   'Manufacturing',
   'Retail',
   'Real Estate',
   'Construction',
   'Other'
];

export function ProfileSetup() {
   const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileData>();
   const [logoFile, setLogoFile] = React.useState<File | null>(null);
   const [signatureFile, setSignatureFile] = React.useState<File | null>(null);
   const [isSubmitting, setIsSubmitting] = React.useState(false);
   const [isEditing, setIsEditing] = React.useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      loadProfile();
   }, []);

   const loadProfile = async () => {
      if (!auth.currentUser) return;

      try {
         const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
         if (userDoc.exists()) {
            const userData = userDoc.data();
            reset(userData);
            setIsEditing(userData.hasCompletedProfile || false);
         }
      } catch (error) {
         console.error('Error loading profile:', error);
         toast.error('Failed to load profile');
      }
   };

   const handleFileUpload = async (file: File, path: string) => {
      if (!auth.currentUser) return null;
      const storageRef = ref(storage, `${auth.currentUser.uid}/${path}/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
   };

   const onSubmit = async (data: ProfileData) => {
     if (!auth.currentUser) return;

     try {
        setIsSubmitting(true);
        let logoUrl = null;
        let signatureUrl = null;

       if (logoFile) {
          logoUrl = await handleFileUpload(logoFile, 'logos');
       }
       if (signatureFile) {
          signatureUrl = await handleFileUpload(signatureFile, 'signatures');
       }

       await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          ...data,
         ...(logoUrl && { logoUrl }),
         ...(signatureUrl && { signatureUrl }),
         hasCompletedProfile: true,
         updatedAt: new Date().toISOString(),
      });

       toast.success(isEditing ? 'Profile updated successfully!' : 'Profile setup completed!');
       if (!isEditing) {
          navigate('/documents');
       }
       setIsEditing(true);
    } catch (error) {
       console.error('Profile setup error:', error);
       toast.error('Failed to update profile');
    } finally {
       setIsSubmitting(false);
     }
  };

   return (
     <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm">
           <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                 {isEditing ? 'Edit Profile' : 'Complete Your Profile'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                 This information will be used in your documents and invoices
              </p>
           </div>

           <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6">
              <div className="space-y-8">
                 {/* Company Information */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Company Name</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('companyName', { required: 'Company name is required' })}
                                className="form-input pl-10"
                                placeholder="Your Company Name"
                             />
                          </div>
                          {errors.companyName && (
                             <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                          )}
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Industry</label>
                          <select
                             {...register('industry', { required: 'Industry is required' })}
                             className="mt-1 form-select pl-10"
                          >
                             <option value="">Select Industry</option>
                             {INDUSTRIES.map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
                             ))}
                          </select>
                          {errors.industry && (
                             <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                          )}
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Business Email</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('email', {
                                   required: 'Email is required',
                                   pattern: {
                                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                      message: 'Invalid email address'
                                   }
                                })}
                                type="email"
                                className="form-input pl-10"
                                placeholder="contact@company.com"
                             />
                          </div>
                          {errors.email && (
                             <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('phone', { required: 'Phone is required' })}
                                className="form-input pl-10"
                                placeholder="+1 (555) 000-0000"
                             />
                          </div>
                          {errors.phone && (
                             <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                          )}
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Website</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('website')}
                                className="form-input pl-10"
                                placeholder="https://www.company.com"
                             />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Tax ID / VAT Number</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Receipt className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('taxId')}
                                className="form-input pl-10"
                                placeholder="Tax ID or VAT Number"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Address Information */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Business Address</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                             </div>
                             <textarea
                                {...register('address', { required: 'Address is required' })}
                                rows={3}
                                className="form-textarea pl-10"
                                placeholder="Enter your complete business address"
                             />
                          </div>
                          {errors.address && (
                             <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                          )}
                       </div>

                       <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                             </div>
                             <textarea
                                {...register('billingAddress')}
                                rows={3}
                                className="form-textarea pl-10"
                                placeholder="Enter billing address (if different from business address)"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Banking & Payment Information */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Banking & Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('bankDetails.bankName')}
                                className="form-input pl-10"
                                placeholder="Enter bank name"
                             />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Account Name</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                             </div>
                             <input
                                {...register('bankDetails.accountName')}
                                className="form-input pl-10"
                                placeholder="Enter account name"
                             />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Account Number</label>
                          <input
                             {...register('bankDetails.accountNumber')}
                             className="mt-1 form-input"
                             placeholder="Enter account number"
                          />
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">SWIFT/BIC Code</label>
                          <input
                             {...register('bankDetails.swiftCode')}
                             className="mt-1 form-input"
                             placeholder="Enter SWIFT/BIC code"
                          />
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                          <select
                             {...register('defaultCurrency')}
                             className="mt-1 form-select"
                             defaultValue="USD"
                          >
                             {CURRENCIES.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                             ))}
                          </select>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Default Payment Terms</label>
                          <input
                             {...register('paymentTerms')}
                             className="mt-1 form-input"
                             placeholder="e.g., Net 30"
                          />
                       </div>
                    </div>
            </div>

                 {/* Logo & Signature Upload */}
                 <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                          <div className="mt-1 flex items-center">
                             <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="logo-upload"
                             />
                             <label
                                htmlFor="logo-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                             >
                                <Upload className="h-5 w-5 mr-2" />
                                Upload Logo
                             </label>
                             {logoFile && <span className="ml-3 text-sm text-gray-600">{logoFile.name}</span>}
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-medium text-gray-700">Signature</label>
                          <div className="mt-1 flex items-center">
                             <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="signature-upload"
                             />
                             <label
                                htmlFor="signature-upload"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                             >
                                <Upload className="h-5 w-5 mr-2" />
                                Upload Signature
                             </label>
                             {signatureFile && <span className="ml-3 text-sm text-gray-600">{signatureFile.name}</span>}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 flex justify-end">
                 {isEditing && (
                    <button
                       type="button"
                       onClick={() => navigate('/documents')}
                       className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                       Cancel
                    </button>
                 )}
                 <button
                    type="submit"
                    disabled={isSubmitting || (!isEditing && !isDirty)}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                 >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Profile' : 'Complete Setup'}
                 </button>
              </div>
           </form>
      </div>
     </div>
  );
}
