import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Rendez-vous', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'Clients', href: '/dashboard/clients', icon: UsersIcon },
    { name: 'Services', href: '/dashboard/services', icon: CreditCardIcon },
    { name: 'Statistiques', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon },
    { name: 'Abonnement', href: '/dashboard/subscription', icon: CreditCardIcon },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Fermer la barre latérale</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4">
                    <h1 className="text-xl font-bold text-primary-600">WhatsApp Booking</h1>
                  </div>
                  <nav className="mt-5 space-y-1 px-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          router.pathname === item.href
                            ? 'bg-secondary-100 text-secondary-900'
                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            router.pathname === item.href
                              ? 'text-secondary-500'
                              : 'text-secondary-400 group-hover:text-secondary-500',
                            'mr-4 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex flex-shrink-0 border-t border-secondary-200 p-4">
                  <div className="group block w-full flex-shrink-0">
                    <div className="flex items-center">
                      <div>
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
                          <span className="text-sm font-medium leading-none text-primary-700">
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <button
                          onClick={handleSignOut}
                          className="text-xs font-medium text-secondary-500 group-hover:text-secondary-700"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-secondary-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">WhatsApp Booking</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    router.pathname === item.href
                      ? 'bg-secondary-100 text-secondary-900'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      router.pathname === item.href
                        ? 'text-secondary-500'
                        : 'text-secondary-400 group-hover:text-secondary-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-secondary-200 p-4">
            <Menu as="div" className="relative inline-block text-left w-full">
              <div>
                <Menu.Button className="group w-full rounded-md px-3.5 py-2 text-left text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex min-w-0 items-center justify-between space-x-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                        <span className="text-sm font-medium leading-none text-primary-700">
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-secondary-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="truncate text-sm text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                    <ChevronDownIcon
                      className="h-5 w-5 flex-shrink-0 text-secondary-400 group-hover:text-secondary-500"
                      aria-hidden="true"
                    />
                  </div>
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute bottom-full left-0 z-10 mb-2 w-full origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/profile"
                          className={classNames(
                            active ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Votre profil
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/dashboard/settings"
                          className={classNames(
                            active ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          Paramètres
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={classNames(
                            active ? 'bg-secondary-100 text-secondary-900' : 'text-secondary-700',
                            'block w-full text-left px-4 py-2 text-sm'
                          )}
                        >
                          Se déconnecter
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir la barre latérale</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
