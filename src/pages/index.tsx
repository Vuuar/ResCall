import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page for better user experience
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Head>
        <title>WhatsApp Booking - Simplify Your Appointments</title>
        <meta name="description" content="Manage your appointments and client communications with ease" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">WhatsApp Booking</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-md text-indigo-600 font-medium hover:bg-indigo-50 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simplify Your Appointment Management
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Connect with clients via WhatsApp and manage your appointments with ease.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link href="/register" className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link href="/pricing" className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">
                View pricing
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold text-xl">1</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900">Register your business</h4>
              <p className="mt-2 text-gray-500">Create your account and set up your business profile with services and availability.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold text-xl">2</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900">Connect WhatsApp</h4>
              <p className="mt-2 text-gray-500">Link your WhatsApp business account to start receiving appointment requests.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold text-xl">3</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900">Manage appointments</h4>
              <p className="mt-2 text-gray-500">Accept, reschedule, or cancel appointments directly from your dashboard.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2">
              <p className="text-center text-base text-gray-400">
                &copy; 2023 WhatsApp Booking. All rights reserved.
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                <Link href="/terms" className="text-gray-400 hover:text-gray-500 mr-4">Terms</Link>
                <Link href="/privacy" className="text-gray-400 hover:text-gray-500 mr-4">Privacy</Link>
                <Link href="/contact" className="text-gray-400 hover:text-gray-500">Contact</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
