
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { DocumentCreate } from './components/documents/DocumentCreate';
import { DocumentList } from './components/documents/DocumentList';
import { DocumentEdit } from './components/documents/DocumentEdit';
import { TemplateManager } from './components/admin/TemplateManager';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';

export default function App() {
   return (
      <Router>
         <Layout>
            <Routes>
               <Route path="/" element={<AuthForm />} />

               <Route path="/profile" element={
                  <AuthGuard>
                     <ProfileSetup />
                  </AuthGuard>
               } />

               <Route path="/documents/new" element={
                  // <AuthGuard>
                  <DocumentCreate />
                  // </AuthGuard>
               } />

               <Route path="/documents" element={
                  <AuthGuard>
                     <DocumentList />
                  </AuthGuard>
               } />

               <Route path="/documents/:id/edit" element={
                  <AuthGuard>
                     <DocumentEdit />
                  </AuthGuard>
               } />

               <Route path="/admin/templates" element={
                  <AuthGuard requireAdmin={true}>
                     <TemplateManager />
                  </AuthGuard>
               } />

               <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
         </Layout>
      </Router>
   );
}
