import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, AvailabilitySchedule, TimeOff } from '@/types';
import { getDayOfWeek, formatDate } from '@/utils/date';
import toast from 'react-hot-toast';

interface AvailabilityProps {
  user: User | null;
}

export default function Availability({ user }: AvailabilityProps) {
  const [weeklySchedule, setWeeklySchedule] = useState<AvailabilitySchedule[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOff | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
  });
  const [timeOffFormData, setTimeOffFormData] = useState({
    start_date: '',
    end_date: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchAvailabilityData();
    }
  }, [user]);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      // Fetch weekly schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('availability_schedule')
        .select('*')
        .eq('professional_id', user?.id)
        .order('day_of_week', { ascending: true });

      if (scheduleError) throw scheduleError;
      
      // If no schedule exists, create default schedule
      if (!scheduleData || scheduleData.length === 0) {
        const defaultSchedule = [];
        for (let i = 0; i < 7; i++) {
          defaultSchedule.push({
            professional_id: user?.id,
            day_of_week: i,
            start_time: i === 0 || i === 6 ? null : '09:00', // Closed on weekends
            end_time: i === 0 || i === 6 ? null : '17:00',   // Closed on weekends
            is_available: !(i === 0 || i === 6),             // Closed on weekends
          });
        }
        
        const { data: insertedData, error: insertError } = await supabase
          .from('availability_schedule')
          .insert(defaultSchedule)
          .select();
          
        if (insertError) throw insertError;
        setWeeklySchedule(insertedData || []);
      } else {
        setWeeklySchedule(scheduleData);
      }

      // Fetch time offs
      const { data: timeOffData, error: timeOffError } = await supabase
        .from('time_offs')
        .select('*')
        .eq('professional_id', user?.id)
        .gte('end_date', new Date().toISOString().split('T')[0]) // Only future and current time offs
        .order('start_date', { ascending: true });

      if (timeOffError) throw timeOffError;
      setTimeOffs(timeOffData || []);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast.error('Erreur lors du chargement des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = (dayOfWeek: number) => {
    const daySchedule = weeklySchedule.find(s => s.day_of_week === dayOfWeek);
    
    setEditingDay(dayOfWeek);
    setScheduleFormData({
      start_time: daySchedule?.start_time || '09:00',
      end_time: daySchedule?.end_time || '17:00',
      is_available: daySchedule?.is_available || false,
    });
    setIsScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setEditingDay(null);
  };

  const openTimeOffModal = (timeOff: TimeOff | null = null) => {
    if (timeOff) {
      setEditingTimeOff(timeOff);
      setTimeOffFormData({
        start_date: timeOff.start_date,
        end_date: timeOff.end_date,
        title: timeOff.title,
        description: timeOff.description || '',
      });
    } else {
      setEditingTimeOff(null);
      const today = new Date().toISOString().split('T')[0];
      setTimeOffFormData({
        start_date: today,
        end_date: today,
        title: '',
        description: '',
      });
    }
    setIsTimeOffModalOpen(true);
  };

  const closeTimeOffModal = () => {
    setIsTimeOffModalOpen(false);
    setEditingTimeOff(null);
  };

  const handleScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setScheduleFormData({ ...scheduleFormData, [name]: target.checked });
    } else {
      setScheduleFormData({ ...scheduleFormData, [name]: value });
    }
  };

  const handleTimeOffInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTimeOffFormData({ ...timeOffFormData, [name]: value });
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDay === null) return;
    
    try {
      const { error } = await supabase
        .from('availability_schedule')
        .update({
          start_time: scheduleFormData.is_available ? scheduleFormData.start_time : null,
          end_time: scheduleFormData.is_available ? scheduleFormData.end_time : null,
          is_available: scheduleFormData.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq('professional_id', user?.id)
        .eq('day_of_week', editingDay);

      if (error) throw error;
      
      toast.success('Horaires mis à jour avec succès');
      closeScheduleModal();
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Erreur lors de la mise à jour des horaires');
    }
  };

  const handleTimeOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTimeOff) {
        // Update existing time off
        const { error } = await supabase
          .from('time_offs')
          .update({
            start_date: timeOffFormData.start_date,
            end_date: timeOffFormData.end_date,
            title: timeOffFormData.title,
            description: timeOffFormData.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTimeOff.id);

        if (error) throw error;
        toast.success('Congé mis à jour avec succès');
      } else {
        // Create new time off
        const { error } = await supabase
          .from('time_offs')
          .insert([
            {
              professional_id: user?.id,
              start_date: timeOffFormData.start_date,
              end_date: timeOffFormData.end_date,
              title: timeOffFormData.title,
              description: timeOffFormData.description || null,
            },
          ]);

        if (error) throw error;
        toast.success('Congé ajouté avec succès');
      }

      closeTimeOffModal();
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error saving time off:', error);
      toast.error('Erreur lors de l\'enregistrement du congé');
    }
  };

  const deleteTimeOff = async (timeOffId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce congé ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('time_offs')
        .delete()
        .eq('id', timeOffId);

      if (error) throw error;
      
      toast.success('Congé supprimé avec succès');
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error deleting time off:', error);
      toast.error('Erreur lors de la suppression du congé');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Head>
        <title>Disponibilités | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Disponibilités</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Weekly schedule */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-lg font-medium text-secondary-900">Horaires hebdomadaires</h2>
              <p className="text-sm text-secondary-500 mt-1 md:mt-0">
                Définissez vos heures d'ouverture habituelles pour chaque jour de la semaine.
              </p>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-12 bg-secondary-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-secondary-900 sm:pl-6">
                        Jour
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                        Statut
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                        Horaires
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Modifier</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 bg-white">
                    {weeklySchedule.map((day) => (
                      <tr key={day.day_of_week}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-secondary-900 sm:pl-6">
                          {getDayOfWeek(day.day_of_week)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            day.is_available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {day.is_available ? 'Ouvert' : 'Fermé'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-500">
                          {day.is_available && day.start_time && day.end_time
                            ? `${day.start_time} - ${day.end_time}`
                            : '-'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => openScheduleModal(day.day_of_week)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Time offs */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-lg font-medium text-secondary-900">Congés et fermetures exceptionnelles</h2>
              <button
                onClick={() => openTimeOffModal()}
                className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un congé
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary-100 rounded"></div>
                ))}
              </div>
            ) : timeOffs.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-secondary-900 sm:pl-6">
                        Titre
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                        Dates
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900">
                        Description
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 bg-white">
                    {timeOffs.map((timeOff) => (
                      <tr key={timeOff.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-secondary-900 sm:pl-6">
                          {timeOff.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-500">
                          {timeOff.start_date === timeOff.end_date
                            ? formatDate(timeOff.start_date, 'PPP')
                            : `${formatDate(timeOff.start_date, 'PPP')} - ${formatDate(timeOff.end_date, 'PPP')}`}
                        </td>
                        <td className="px-3 py-4 text-sm text-secondary-500 max-w-xs truncate">
                          {timeOff.description || '-'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openTimeOffModal(timeOff)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteTimeOff(timeOff.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-secondary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-secondary-900">Aucun congé planifié</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Ajoutez vos périodes de congés ou fermetures exceptionnelles.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => openTimeOffModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter un congé
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule modal */}
      {isScheduleModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleScheduleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-secondary-900">
                        Modifier les horaires - {editingDay !== null ? getDayOfWeek(editingDay) : ''}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="is_available"
                              name="is_available"
                              type="checkbox"
                              checked={scheduleFormData.is_available}
                              onChange={handleScheduleInputChange}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="is_available" className="font-medium text-secondary-700">
                              Jour ouvré
                            </label>
                            <p className="text-secondary-500">
                              Cochez cette case si vous êtes disponible ce jour-là.
                            </p>
                          </div>
                        </div>

                        {scheduleFormData.is_available && (
                          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="start_time" className="block text-sm font-medium text-secondary-700">
                                Heure d'ouverture
                              </label>
                              <input
                                type="time"
                                name="start_time"
                                id="start_time"
                                required
                                value={scheduleFormData.start_time}
                                onChange={handleScheduleInputChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="end_time" className="block text-sm font-medium text-secondary-700">
                                Heure de fermeture
                              </label>
                              <input
                                type="time"
                                name="end_time"
                                id="end_time"
                                required
                                value={scheduleFormData.end_time}
                                onChange={handleScheduleInputChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Time off modal */}
      {isTimeOffModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-secondary-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleTimeOffSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-secondary-900">
                        {editingTimeOff ? 'Modifier le congé' : 'Ajouter un congé'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
                            Titre *
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={timeOffFormData.title}
                            onChange={handleTimeOffInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            placeholder="ex: Vacances d'été, Jour férié, etc."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-secondary-700">
                              Date de début *
                            </label>
                            <input
                              type="date"
                              name="start_date"
                              id="start_date"
                              required
                              value={timeOffFormData.start_date}
                              onChange={handleTimeOffInputChange}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-secondary-700">
                              Date de fin *
                            </label>
                            <input
                              type="date"
                              name="end_date"
                              id="end_date"
                              required
                              value={timeOffFormData.end_date}
                              onChange={handleTimeOffInputChange}
                              min={timeOffFormData.start_date}
                              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={timeOffFormData.description}
                            onChange={handleTimeOffInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                            placeholder="Informations supplémentaires (optionnel)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingTimeOff ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={closeTimeOffModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
