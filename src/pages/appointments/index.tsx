import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import Layout from '@/components/Layout';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import AppointmentForm from '@/components/AppointmentForm';
import { Dialog } from '@headlessui/react';

export default function Appointments() {
  const { user, loading: userLoading } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (userLoading) {
    return (
      <Layout>
        <div className="p-8 text-center">Chargement...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">Veuillez vous connecter pour accéder à cette page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Rendez-vous</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nouveau rendez-vous
          </button>
        </div>
        
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          <AppointmentCalendar professionalId={user.id} />
        </div>
        
        {/* New appointment modal */}
        <Dialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium mb-4">
                Nouveau rendez-vous
              </Dialog.Title>
              
              <AppointmentForm
                professionalId={user.id}
                onSuccess={() => setIsFormOpen(false)}
              />
              
              <button
                onClick={() => setIsFormOpen(false)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Annuler
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </Layout>
  );
}
