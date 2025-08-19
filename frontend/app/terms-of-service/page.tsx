"use client";

import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const TermsOfService = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 sm:p-10">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            aria-label="Go back"
          >
            <FaArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 ml-4">
            Terms of Service
          </h1>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome to our website. By accessing or using our services, you agree to be bound by the following terms and conditions:
        </p>

        <section className="space-y-8">
          <div className="border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By using our services, you agree to comply with and be legally bound by these terms. If you do not agree to these terms, please do not use our services.
            </p>
          </div>
          <div className="border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">2. Use of Services</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to use our services only for lawful purposes and in accordance with these terms. You must not misuse our services or use them for any unauthorized or illegal activities.
            </p>
          </div>
          <div className="border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">3. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content, trademarks, and logos on this website are the property of our business. You may not use, reproduce, or distribute any content without our prior written consent.
            </p>
          </div>
          <div className="border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">4. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              We are not liable for any damages or losses resulting from your use of our services. Use our services at your own risk.
            </p>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">5. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to update or modify these terms at any time. Please review these terms periodically for changes.
            </p>
          </div>
        </section>

        <div className="mt-8 text-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            If you have any questions about these terms, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;