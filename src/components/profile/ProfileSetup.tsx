import React from 'react';
import { useForm } from 'react-hook-form';
import { db, storage, auth } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload } from 'lucide-react';

type ProfileData = {
   companyName: string;
   address: string;
   phone: string;
   website: string;
};

export function ProfileSetup() {
   const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>();
   const [logoFile, setLogoFile] = React.useState<File | null>(null);
   const [signatureFile, setSignatureFile] = React.useState<File | null>(null);

   const handleFileUpload = async (file: File, path: string) => {
      if (!auth.currentUser) return null;
      const storageRef = ref(storage, `${auth.currentUser.uid}/${path}/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
   };

   const onSubmit = async (data: ProfileData) => {
      try {
         if (!auth.currentUser) return;
         // console.log(auth.currentUser.uid)
         let logoUrl = null;
         let signatureUrl = null;

         if (logoFile) {
            logoUrl = await handleFileUpload(logoFile, 'logos');
         }
         if (signatureFile) {
            signatureUrl = await handleFileUpload(signatureFile, 'signatures');
         }

         await setDoc(doc(db, 'profiles', auth.currentUser.uid), {
            ...data,
            logoUrl,
            signatureUrl,
            updatedAt: new Date().toISOString(),
         });
      } catch (error) {
         console.error('Profile setup error:', error);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-6">
         <h2 className="text-2xl font-bold mb-6">Profile Setup</h2>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700">Company Name</label>
               <input
                  {...register('companyName', { required: true })}
                  className="form-input"
               />
               {errors.companyName && <p className="mt-1 text-sm text-red-600">Company name is required</p>}
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700">Address</label>
               <textarea
                  {...register('address', { required: true })}
                  className="form-input"
               />
               {errors.address && <p className="mt-1 text-sm text-red-600">Address is required</p>}
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700">Phone</label>
               <input
                  {...register('phone', { required: true })}
                  className="form-input"
               />
               {errors.phone && <p className="mt-1 text-sm text-red-600">Phone is required</p>}
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700">Website</label>
               <input
                  {...register('website')}
                  className="form-input"
               />
            </div>

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
                  {logoFile && <span className="ml-3">{logoFile.name}</span>}
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
                  {signatureFile && <span className="ml-3">{signatureFile.name}</span>}
               </div>
            </div>

            <div>
               <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
               >
                  Save Profile
               </button>
            </div>
         </form>
      </div>
   );
}
