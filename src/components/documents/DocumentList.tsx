import { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FileText, File, Clock, Check, AlertCircle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Document = {
   id: string;
   title: string;
   type: 'contract' | 'invoice';
   description: string;
   status: 'draft' | 'final' | 'pending';
   createdAt: string;
};

export function DocumentList() {
   const [documents, setDocuments] = useState<Document[]>([]);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchDocuments = async () => {
         if (!auth.currentUser) return;

         try {
            const q = query(
               collection(db, 'documents'),
               where('userId', '==', auth.currentUser.uid),
               orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({
               id: doc.id,
               ...doc.data()
            } as Document));

            setDocuments(docs);
         } catch (error) {
            console.error('Error fetching documents:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchDocuments();
   }, []);

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'draft':
            return <Clock className="h-5 w-5 text-yellow-500" />;
         case 'final':
            return <Check className="h-5 w-5 text-green-500" />;
         default:
            return <AlertCircle className="h-5 w-5 text-gray-400" />;
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
         </div>
      );
   }

   return (
      <div className="max-w-4xl mx-auto p-6">
         <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>

         <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
               {documents.map((doc) => (
                  <li key={doc.id}>
                     <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center flex-1">
                              {doc.type === 'contract' ? (
                                 <FileText className="h-6 w-6 text-indigo-600" />
                              ) : (
                                 <File className="h-6 w-6 text-indigo-600" />
                              )}
                              <div className="ml-4">
                                 <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                                 <p className="text-sm text-gray-500">{doc.description}</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-4">
                              {getStatusIcon(doc.status)}
                              <span className="text-sm text-gray-500">
                                 {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                 onClick={() => navigate(`/documents/${doc.id}/edit`)}
                                 className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                              >
                                 <Edit2 className="h-5 w-5" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </li>
               ))}

               {documents.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">
                     No documents created yet. Start by creating a new document.
                  </li>
               )}
            </ul>
         </div>
      </div>
   );
}
