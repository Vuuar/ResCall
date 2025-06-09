import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout title="WhatsApp Booking - Accueil">
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative bg-primary-700">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary-800" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">WhatsApp Booking</h1>
            <p className="mt-6 text-xl text-primary-100 max-w-3xl">
              Simplifiez la gestion de vos rendez-vous et améliorez votre relation client grâce à WhatsApp.
            </p>
            <div className="mt-10 flex space-x-4">
              <Link href="/login" className="inline-block bg-white py-3 px-6 border border-transparent rounded-md text-base font-medium text-primary-700 hover:bg-primary-50">
                Se connecter
              </Link>
              <Link href="/register" className="inline-block bg-primary-600 py-3 px-6 border border-transparent rounded-md text-base font-medium text-white hover:bg-primary-500">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-16 bg-secondary-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Fonctionnalités</h2>
              <p className="mt-1 text-4xl font-extrabold text-secondary-900 sm:text-5xl sm:tracking-tight">
                Tout ce dont vous avez besoin
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-secondary-500">
                Une solution complète pour gérer vos rendez-vous et communiquer avec vos clients via WhatsApp.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">Gestion des rendez-vous</h3>
                      <p className="mt-5 text-base text-secondary-500">
                        Gérez facilement votre calendrier et permettez à vos clients de prendre rendez-vous en quelques clics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">Communication WhatsApp</h3>
                      <p className="mt-5 text-base text-secondary-500">
                        Communiquez avec vos clients via WhatsApp directement depuis notre plateforme.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">Rappels automatiques</h3>
                      <p className="mt-5 text-base text-secondary-500">
                        Envoyez des rappels automatiques à vos clients pour réduire les rendez-vous manqués.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Prêt à simplifier votre gestion de rendez-vous?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Inscrivez-vous dès aujourd'hui et commencez à utiliser WhatsApp Booking pour votre entreprise.
            </p>
            <Link href="/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 sm:w-auto">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
