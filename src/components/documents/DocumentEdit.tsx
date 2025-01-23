import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export function DocumentEdit() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [document, setDocument] = useState<any>(null);
   const [content, setContent] = useState('');
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchDocument = async () => {
         if (!id || !auth.currentUser) return;

         try {
            const docRef = doc(db, 'documents', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().userId === auth.currentUser.uid) {
               setDocument(docSnap.data());
               setContent(docSnap.data().generatedContent);
            } else {
               setError('Document not found');
            }
         } catch (err) {
            console.error('Error fetching document:', err);
            setError('Failed to load document');
         }
      };

      fetchDocument();
   }, [id]);

   const handleSave = async () => {
      if (!id || !auth.currentUser) return;

      try {
         setSaving(true);
         await updateDoc(doc(db, 'documents', id), {
            generatedContent: content,
            updatedAt: new Date().toISOString()
         });
         setSaving(false);
      } catch (err) {
         console.error('Error saving document:', err);
         setError('Failed to save changes');
         setSaving(false);
      }
   };

   if (error) {
      return (
         <div className="max-w-4xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
               <p className="text-red-600">{error}</p>
            </div>
         </div>
      );
   }

   if (!document) {
      return (
         <div className="max-w-4xl mx-auto p-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
         </div>
      );
   }

   return (
      <div className="max-w-4xl mx-auto p-6">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
               <button
                  onClick={() => navigate('/documents')}
                  className="text-gray-600 hover:text-gray-900"
               >
                  <ArrowLeft className="h-6 w-6" />
               </button>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                  <p className="text-sm text-gray-500">{document.type}</p>
               </div>
            </div>
            <button
               onClick={handleSave}
               disabled={saving}
               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {saving ? (
                  <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Saving...
                  </>
               ) : (
                  <>
                     <Save className="h-4 w-4 mr-2" />
                     Save Changes
                  </>
               )}
            </button>
         </div>

         <div data-color-mode="light" className="rounded-lg border border-gray-200">
            <MDEditor
               value={content}
               onChange={setContent}
               preview="edit"
               height={600}
               className="w-full"
            />
         </div>
      </div>
   );
}
