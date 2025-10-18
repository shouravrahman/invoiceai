import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
   Bold, Italic, List, ListOrdered, Table as TableIcon,
   AlignLeft, AlignCenter, AlignRight, Undo, Redo,
   FileDown, Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DocumentEditorProps {
   content: string;
   onChange: (content: string) => void;
   template?: any;
}

export function DocumentEditor({ content, onChange, template }: DocumentEditorProps) {
   const editor = useEditor({
      extensions: [
         StarterKit,
         Document,
         Placeholder.configure({
            placeholder: 'Start typing...',
         }),
         Table.configure({
            resizable: true,
            HTMLAttributes: {
               class: 'border-collapse table-auto w-full',
            },
         }),
         TableRow,
         TableHeader,
         TableCell,
      ],
      content,
      onUpdate: ({ editor }) => {
         onChange(editor.getHTML());
      },
   });

   useEffect(() => {
      if (editor && template) {
         editor.commands.setContent(template.content);
      }
   }, [editor, template]);

   const addTable = () => {
      editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
   };

   const exportToPDF = async () => {
      const element = document.querySelector('.ProseMirror');
      if (!element) return;

      const canvas = await html2canvas(element as HTMLElement);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
         orientation: 'portrait',
         unit: 'px',
         format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('document.pdf');
   };

   const print = () => {
      const content = document.querySelector('.ProseMirror')?.innerHTML;
      if (!content) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
   };

   if (!editor) {
      return null;
   }

   return (
      <div className="border rounded-lg bg-white">
         <div className="border-b p-2 flex flex-wrap gap-2">
            <button
               onClick={() => editor.chain().focus().toggleBold().run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
            >
               <Bold className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleItalic().run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
            >
               <Italic className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleBulletList().run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
            >
               <List className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().toggleOrderedList().run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
            >
               <ListOrdered className="h-5 w-5" />
            </button>
            <button
               onClick={addTable}
               className="p-2 rounded hover:bg-gray-100"
            >
               <TableIcon className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('left').run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''}`}
            >
               <AlignLeft className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('center').run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''}`}
            >
               <AlignCenter className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().setTextAlign('right').run()}
               className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''}`}
            >
               <AlignRight className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().undo().run()}
               className="p-2 rounded hover:bg-gray-100"
            >
               <Undo className="h-5 w-5" />
            </button>
            <button
               onClick={() => editor.chain().focus().redo().run()}
               className="p-2 rounded hover:bg-gray-100"
            >
               <Redo className="h-5 w-5" />
            </button>

            <div className="ml-auto flex gap-2">
               <button
                  onClick={exportToPDF}
                  className="p-2 rounded hover:bg-gray-100 text-blue-600"
                  title="Export as PDF"
               >
                  <FileDown className="h-5 w-5" />
               </button>
               <button
                  onClick={print}
                  className="p-2 rounded hover:bg-gray-100 text-blue-600"
                  title="Print"
               >
                  <Printer className="h-5 w-5" />
               </button>
            </div>
         </div>

         <EditorContent
            editor={editor}
            className="prose max-w-none p-4 min-h-[500px] focus:outline-none"
         />
      </div>
   );
}
