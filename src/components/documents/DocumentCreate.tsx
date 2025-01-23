import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { generateDocument } from '../../lib/ai';
import { VoiceInput } from '../voice/VoiceInput';
import { FileText, Receipt, Loader2, Wand2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

interface FormData {
   title: string;
   description: string;
   content: string;
   type: 'contract' | 'invoice';
   industry?: string;
   jurisdiction?: string;
   template?: string;
}

export function DocumentCreate() {
   const [documentType, setDocumentType] = useState<'contract' | 'invoice'>('contract');
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedContent, setGeneratedContent] = useState('');
   const [selectedTemplate, setSelectedTemplate] = useState('');
   const navigate = useNavigate();

   const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
      defaultValues: {
         type: documentType,
      }
   });

   const handleVoiceTranscript = (text: string) => {
      const currentContent = watch('content');
      setValue('content', currentContent ? `${currentContent} ${text}` : text);
   };

   const handleGenerate = async (data: FormData) => {
      try {
         setIsGenerating(true);
         const content = await generateDocument({
            ...data,
            type: documentType,
            template: selectedTemplate
         });
         setGeneratedContent(content);
      } catch (error) {
         console.error('Generation error:', error);
      } finally {
         setIsGenerating(false);
      }
   };

   const onSubmit = async (data: FormData) => {
      if (!auth.currentUser) return;

      try {
         const docRef = await addDoc(collection(db, 'documents'), {
            ...data,
            userId: auth.currentUser.uid,
            generatedContent: generatedContent || data.content,
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
      <div className="max-w-4xl mx-auto">
         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Document Type Selection */}
            <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Document</h2>
               <div className="grid grid-cols-2 gap-4">
                  <button
                     type="button"
                     onClick={() => setDocumentType('contract')}
                     className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${documentType === 'contract'
                           ? 'border-indigo-600 bg-indigo-50'
                           : 'border-gray-200 hover:border-indigo-200'
                        }`}
                  >
                     <FileText className={`h-8 w-8 mb-2 ${documentType === 'contract' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                     <span className={`font-medium ${documentType === 'contract' ? 'text-indigo-600' : 'text-gray-900'
                        }`}>
                        Contract
                     </span>
                     <span className="text-sm text-gray-500">
                        Legal agreements and contracts
                     </span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setDocumentType('invoice')}
                     className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${documentType === 'invoice'
                           ? 'border-indigo-600 bg-indigo-50'
                           : 'border-gray-200 hover:border-indigo-200'
                        }`}
                  >
                     <Receipt className={`h-8 w-8 mb-2 ${documentType === 'invoice' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                     <span className={`font-medium ${documentType === 'invoice' ? 'text-indigo-600' : 'text-gray-900'
                        }`}>
                        Invoice
                     </span>
                     <span className="text-sm text-gray-500">
                        Professional billing documents
                     </span>
                  </button>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
               {/* Basic Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Document Title</label>
                     <input
                        {...register('title', { required: 'Title is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={documentType === 'contract' ? 'e.g., Service Agreement' : 'e.g., Website Development Invoice'}
                     />
                     {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700">Industry</label>
                     <select
                        {...register('industry')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                     >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="consulting">Consulting</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="construction">Construction</option>
                        <option value="education">Education</option>
                        <option value="finance">Finance</option>
                        <option value="legal">Legal</option>
                        <option value="real-estate">Real Estate</option>
                     </select>
                  </div>
               </div>

               {/* Jurisdiction (for contracts) */}
               {documentType === 'contract' && (
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Jurisdiction</label>
                     <select
                        {...register('jurisdiction')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                     >
                        <option value="">Select Jurisdiction</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="EU">European Union</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="NZ">New Zealand</option>
                        <option value="SG">Singapore</option>
                     </select>
                     <p className="mt-1 text-sm text-gray-500">
                        Choose the legal jurisdiction for this contract
                     </p>
                  </div>
               )}

               {/* Description */}
               <div>
                  <label className="block text-sm font-medium text-gray-700">Brief Description</label>
                  <input
                     {...register('description', { required: 'Description is required' })}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                     placeholder="Describe the purpose of this document"
                  />
                  {errors.description && (
                     <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
               </div>

               {/* Content Input */}
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="block text-sm font-medium text-gray-700">Document Content</label>
                     <div className="flex items-center space-x-3">
                        <VoiceInput onTranscript={handleVoiceTranscript} />
                        <button
                           type="button"
                           onClick={() => handleGenerate(watch())}
                           disabled={isGenerating}
                           className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                           {isGenerating ? (
                              <>
                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                 Generating...
                              </>
                           ) : (
                              <>
                                 <Wand2 className="h-4 w-4 mr-2" />
                                 Generate with AI
                              </>
                           )}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="rounded-md shadow-sm">
                        <textarea
                           {...register('content', { required: 'Content is required' })}
                           rows={6}
                           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           placeholder="Describe what you want to include in this document..."
                        />
                     </div>

                     {generatedContent && (
                        <div className="border rounded-md p-4 bg-gray-50">
                           <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Content</h4>
                           <div data-color-mode="light">
                              <MDEditor
                                 value={generatedContent}
                                 onChange={setGeneratedContent}
                                 preview="edit"
                                 height={400}
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  {errors.content && (
                     <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
               </div>

               {/* Submit Button */}
               <div className="flex justify-end pt-4">
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                           Creating...
                        </>
                     ) : (
                        'Create Document'
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
