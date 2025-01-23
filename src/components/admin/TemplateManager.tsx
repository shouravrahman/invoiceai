import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Save } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { captureError } from '../../lib/sentry';

interface Template {
   id: string;
   name: string;
   type: 'contract' | 'invoice';
   content: string;
   description: string;
   createdAt: string;
}

interface TemplateForm {
   name: string;
   type: 'contract' | 'invoice';
   description: string;
}

export function TemplateManager() {
   const [templates, setTemplates] = useState<Template[]>([]);
   const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
   const [content, setContent] = useState('');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const { register, handleSubmit, reset, formState: { errors } } = useForm<TemplateForm>();
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      fetchTemplates();
   }, []);

   const fetchTemplates = async () => {
      try {
         setLoading(true);
         const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
         const querySnapshot = await getDocs(q);
         const templateList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
         } as Template));
         setTemplates(templateList);
      } catch (error) {
         captureError(error);
         setError('Failed to load templates');
      } finally {
         setLoading(false);
      }
   };

   const onSubmit = async (data: TemplateForm) => {
      try {
         setSaving(true);
         await addDoc(collection(db, 'templates'), {
            ...data,
            content,
            createdAt: new Date().toISOString()
         });
         reset();
         setContent('');
         await fetchTemplates();
         setError(null);
      } catch (error) {
         captureError(error);
         setError('Failed to save template');
      } finally {
         setSaving(false);
      }
   };

   const deleteTemplate = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this template?')) return;

      try {
         await deleteDoc(doc(db, 'templates', id));
         await fetchTemplates();
         if (selectedTemplate === id) {
            setSelectedTemplate(null);
            setContent('');
         }
         setError(null);
      } catch (error) {
         captureError(error);
         setError('Failed to delete template');
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
         </div>
      );
   }

   return (
      <div className="max-w-6xl mx-auto p-6">
         <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
            <p className="mt-2 text-gray-600">Create and manage document templates</p>
         </div>

         {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
               {error}
            </div>
         )}

         <div className="grid grid-cols-12 gap-6">
            {/* Template List */}
            <div className="col-span-4 bg-white rounded-lg shadow">
               <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Templates</h3>
               </div>
               <ul className="divide-y divide-gray-200">
                  {templates.map((template) => (
                     <li
                        key={template.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedTemplate === template.id ? 'bg-indigo-50' : ''
                           }`}
                        onClick={() => {
                           setSelectedTemplate(template.id);
                           setContent(template.content);
                        }}
                     >
                        <div className="flex justify-between items-center">
                           <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-500">{template.type}</p>
                           </div>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 deleteTemplate(template.id);
                              }}
                              className="text-gray-400 hover:text-red-600"
                           >
                              <Trash2 className="h-5 w-5" />
                           </button>
                        </div>
                     </li>
                  ))}
                  {templates.length === 0 && (
                     <li className="p-4 text-center text-gray-500">
                        No templates yet. Create your first template.
                     </li>
                  )}
               </ul>
            </div>

            {/* Template Editor */}
            <div className="col-span-8">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Template Name</label>
                        <input
                           {...register('name', { required: 'Template name is required' })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.name && (
                           <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                           {...register('type', { required: 'Template type is required' })}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                           <option value="contract">Contract</option>
                           <option value="invoice">Invoice</option>
                        </select>
                        {errors.type && (
                           <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                        )}
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700">Description</label>
                     <input
                        {...register('description', { required: 'Description is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                     />
                     {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                     )}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                     <div data-color-mode="light">
                        <MDEditor
                           value={content}
                           onChange={setContent}
                           preview="edit"
                           height={400}
                        />
                     </div>
                     <p className="mt-2 text-sm text-gray-500">
                        Use placeholders like {{ companyName }}, {{ address }}, {{ phone }}, {{ website }}, {{ logo }}, {{ signature }}
                     </p>
                  </div>

                  <div className="flex justify-end">
                     <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                     >
                        {saving ? (
                           <>
                              <Save className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                           </>
                        ) : (
                           <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Template
                           </>
                        )}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}
