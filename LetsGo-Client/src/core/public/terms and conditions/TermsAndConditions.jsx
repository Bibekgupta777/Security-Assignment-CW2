import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-4xl font-bold text-center mb-8">Terms & Conditions</h1>

      <p className="text-lg mb-6">
        Welcome to <strong>Let’s Go</strong>! By using our services, you agree to the following terms and conditions.
        Please read them carefully.
      </p>

      <div className="space-y-4 text-gray-700">
        <p>
          1. <strong>Acceptance of Terms:</strong> By accessing or using Let’s Go, you agree to comply with and be
          bound by these terms and conditions.
        </p>
        <p>
          2. <strong>Service Usage:</strong> You must provide accurate and up-to-date booking information. Any false
          details may result in account suspension.
        </p>
        <p>
          3. <strong>Payments:</strong> All payments are processed securely. Refunds are subject to Let’s Go’s refund
          policy, and requests must be submitted within the defined period.
        </p>
        <p>
          4. <strong>Limitation of Liability:</strong> Let’s Go is not responsible for delays or cancellations caused by
          third-party transport providers.
        </p>
        <p>
          5. <strong>Changes to Terms:</strong> Let’s Go reserves the right to modify these terms at any time. Users
          will be notified of any significant updates.
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-600">
        If you have any questions regarding these terms, please contact our support team.
      </p>

      <div className="text-center mt-10">
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default TermsAndConditions;
