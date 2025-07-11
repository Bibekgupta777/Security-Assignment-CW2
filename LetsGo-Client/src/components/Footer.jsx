import React from "react";

const Footer = () => {
  return (
    <footer className="bg-zinc-600 text-white py-10 md:px-20 px-4 md:mt-10 mt-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start">
        {/* Left Section */}
        <div className="mb-6 md:mb-0">
          <h1 className="text-3xl font-bold mb-2">Let's Go</h1>
          <p className="text-gray-400">
            Let’s Go is a digital platform to make your <br/> daily commuting better.
          </p>
        </div>

        {/* Right Section */}
        <div className="text-center md:text-right">
          <p className="mb-2">Download our app</p>
          <a
            href="#"
            className="inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="w-40"
            />
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-6"></div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-gray-400">© all rights reserved, Let’s Go services limited. 2024</p>
        <div className="flex space-x-6 mt-4 md:mt-0 text-gray-300">
          <a href="#" className="hover:text-white">
            Terms & condition
          </a>
          <a href="#" className="hover:text-white">
            Return & refund policy
          </a>
          <a href="#" className="hover:text-white">
            Privacy policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;