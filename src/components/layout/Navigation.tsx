
import { Link, useLocation } from 'react-router-dom';
import { Settings, FileArchive, Plus, List } from 'lucide-react';

export function Navigation() {
   const location = useLocation();
   const isActive = (path: string) => location.pathname === path;

   return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:border-t-0 md:border-b">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between md:justify-start space-x-4 py-3">
               <Link
                  to="/documents"
                  className={`flex flex-col md:flex-row items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/documents') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                     }`}
               >
                  <List className="h-5 w-5 md:mr-2" />
                  <span>Documents</span>
               </Link>

               <Link
                  to="/documents/new"
                  className={`flex flex-col md:flex-row items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/documents/new') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                     }`}
               >
                  <Plus className="h-5 w-5 md:mr-2" />
                  <span>Create</span>
               </Link>

               <Link
                  to="/admin/templates"
                  className={`flex flex-col md:flex-row items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/templates') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                     }`}
               >
                  <FileArchive className="h-5 w-5 md:mr-2" />
                  <span>Templates</span>
               </Link>

               <Link
                  to="/profile"
                  className={`flex flex-col md:flex-row items-center px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                     }`}
               >
                  <Settings className="h-5 w-5 md:mr-2" />
                  <span>Profile</span>
               </Link>
            </div>
         </div>
      </nav>
   );
}
