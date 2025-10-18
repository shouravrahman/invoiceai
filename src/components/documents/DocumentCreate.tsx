import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { generateDocument } from '../../lib/ai';
import { DocumentEditor } from '../editor/DocumentEditor';
import { VoiceInput } from '../voice/VoiceInput';
import { templates, Template } from '../../lib/templates';
import { FileText, Receipt, Loader2, Wand2 } from 'lucide-react';

interface FormData {
   title: string;
   description: string;
   type: 'contract' | 'invoice';
   template: string;
}

export function DocumentCreate() {
   const [documentType, setDocumentType] = useState<'contract' | 'invoice'>('contract');
   const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
   const [content, setContent] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [userData, setUserData] = useState<any>(null);
   const navigate = useNavigate();

   const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
      defaultValues: {
         type: documentType,
      }
   });

   useEffect(() => {
      const fetchUserData = async () => {
         if (!auth.currentUser) return;
         const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
         if (userDoc.exists()) {
            setUserData(userDoc.data());
         }
      };
      fetchUserData();
   }, []);

   useEffect(() => {
      const template = templates.find(t => t.type === documentType);
      if (template) {
         setSelectedTemplate(template);
         setValue('template', template.id);
         // Reset content when template changes
         setContent('');
      }
   }, [documentType, setValue]);

   const handleVoiceInput = async (transcript: string) => {
      if (!selectedTemplate) return;

      try {
         setIsGenerating(true);
         const generatedContent = await generateDocument({
            type: documentType,
            title: watch('title') || 'Untitled Document',
            description: transcript,
            content: transcript,
            template: selectedTemplate,
            userData,
         });
         setContent(generatedContent);
      } catch (error) {
         console.error('Generation error:', error);
      } finally {
         setIsGenerating(false);
      }
   };

   const handleGenerate = async (data: FormData) => {
     if (!selectedTemplate) return;

     try {
        setIsGenerating(true);
       const generatedContent = await generateDocument({
          ...data,
          type: documentType,
         template: selectedTemplate,
         userData,
      });
        setContent(generatedContent);
     } catch (error) {
        console.error('Generation error:', error);
     } finally {
        setIsGenerating(false);
     }
  };

   const onSubmit = async (data: FormData) => {
     if (!auth.currentUser || !content) return;

     try {
        const docRef = await addDoc(collection(db, 'documents'), {
           ...data,
         content,
         userId: auth.currentUser.uid,
         status: 'draft',
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
      });

        navigate(`/documents/${docRef.id}/edit`);
     } catch (error) {
        console.error('Error saving document:', error);
     }
  };

   return (
     <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
           {/* Document Type Selection */}
           <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Document</h2>
              <div className="grid grid-cols-2 gap-6">
                 <button
                    type="button"
                    onClick={() => setDocumentType('contract')}
                    className={`relative flex flex-col items-center p-8 rounded-lg border-2 transition-colors ${documentType === 'contract'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                       }`}
                 >
                    <FileText className={`h-10 w-10 mb-4 ${documentType === 'contract' ? 'text-indigo-600' : 'text-gray-400'
                       }`} />
                    <span className={`text-lg font-medium ${documentType === 'contract' ? 'text-indigo-600' : 'text-gray-900'
                       }`}>
                       Contract
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                       Legal agreements and contracts
                    </span>
                 </button>

                 <button
                    type="button"
                    onClick={() => setDocumentType('invoice')}
                    className={`relative flex flex-col items-center p-8 rounded-lg border-2 transition-colors ${documentType === 'invoice'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                       }`}
                 >
                    <Receipt className={`h-10 w-10 mb-4 ${documentType === 'invoice' ? 'text-indigo-600' : 'text-gray-400'
                       }`} />
                    <span className={`text-lg font-medium ${documentType === 'invoice' ? 'text-indigo-600' : 'text-gray-900'
                       }`}>
                       Invoice
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                       Professional billing documents
                    </span>
                 </button>
              </div>
           </div>

           {/* Document Details */}
           <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-6">
                 <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Document Title</label>
                    <input
                       {...register('title', { required: 'Title is required' })}
                       className="form-input w-full"
                       placeholder={documentType === 'contract' ? 'e.g., Service Agreement' : 'e.g., Website Development Invoice'}
                    />
                    {errors.title && (
                       <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                    )}
                 </div>

                 <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Description or Voice Input</label>
                    <div className="flex items-start space-x-4">
                       <div className="flex-1">
                          <textarea
                             {...register('description', { required: 'Description is required' })}
                             rows={4}
                             className="form-textarea w-full"
                             placeholder="Describe what you want to generate, or use voice input..."
                  />
                  {errors.description && (
                             <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                  )}
                       </div>
                       <VoiceInput onTranscript={handleVoiceInput} />
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <button
                       type="button"
                       onClick={() => handleGenerate(watch())}
                       disabled={isGenerating}
                       className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                       {isGenerating ? (
                          <>
                             <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                             Generating...
                          </>
                       ) : (
                          <>
                             <Wand2 className="h-5 w-5 mr-3" />
                             Generate with AI
                          </>
                       )}
                    </button>
                 </div>
              </div>
           </div>

           {/* Document Preview */}
           {content && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Document</h3>
                 <DocumentEditor
                    content={content}
                    onChange={setContent}
                    template={selectedTemplate}
                 />

                 <div className="mt-6 flex justify-end">
                    <button
                       type="submit"
                       disabled={isSubmitting}
                       className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                       {isSubmitting ? (
                          <>
                             <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                             Saving...
                          </>
                       ) : (
                          'Save Document'
                       )}
                    </button>
                 </div>
              </div>
           )}
        </form>
     </div>
  );
}
