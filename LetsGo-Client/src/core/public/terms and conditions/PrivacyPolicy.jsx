import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>

      <p className="text-lg mb-6">
        Your privacy is important to us at <strong>Let’s Go</strong>. This policy explains how we collect, use, and protect your data.
      </p>

      <div className="space-y-4 text-gray-700">
        <p>
          1. <strong>Information We Collect:</strong> We collect personal data such as your name, email, and booking details to provide our services.
        </p>
        <p>
          2. <strong>How We Use Your Information:</strong> Your data is used for processing bookings, enhancing user experience, and improving our services.
        </p>
        <p>
          3. <strong>Data Security:</strong> We implement security measures to protect your data from unauthorized access, but we cannot guarantee complete security.
        </p>
        <p>
          4. <strong>Cookies:</strong> We use cookies to collect anonymous information about website traffic and user interactions.
        </p>
        <p>
          5. <strong>Your Rights:</strong> You can request access to your data or ask for its deletion by contacting our support team.
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-600">
        Let’s Go may update this privacy policy as needed. Significant changes will be communicated to users.
      </p>

      <div className="text-center mt-10">
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
