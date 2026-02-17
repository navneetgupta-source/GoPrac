import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Logo and Company Info */}
          <div className="">
            <div className="text-3xl font-bold mb-6">
              Go<span className="text-orange-500">Prac</span>
            </div>
            {/* <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              AI-powered hiring and upskilling platform connecting top tech talent with leading companies across India.
            </p> */}
            {/* <div className="text-sm text-gray-400">
              Copyright © GoPrac.com
            </div> */}
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="text-orange-500 mr-3 flex-shrink-0" size={20} />
                <span className="text-gray-300">6360060622</span>
              </div>
              <div className="flex items-center">
                <Mail className="text-orange-500 mr-3 flex-shrink-0" size={20} />
                <span className="text-gray-300">info@goprac.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="text-orange-500 mr-3 flex-shrink-0 mt-1" size={20} />
                <div className="text-gray-300 text-sm leading-relaxed">
                WorkFlo Ranka Junction, PROPERTY NO. 224, 3RD FLOOR, #80/3,
                VIJINAPUR VILLAGE OLD MADRAS ROAD K R PURAM HOBLI,
                BENGALURU (KSN) BANGALORE, KAR 560016
                </div>
              </div>
            </div>
          </div>

          {/* Social Links and Legal */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Social Links</h3>
            <div className="flex space-x-4 mb-8">
              <a
                href="https://wa.me/6360060622"
                className="bg-green-600 hover:bg-green-700 p-3 rounded-xl transition-colors duration-200"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/goprac/?originalSubdomain=in"
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-colors duration-200"
              >
                <Linkedin size={20} />
              </a>
            </div>

            <div className="space-y-3">
              <a href="/refund" className="block text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Refund Policy
              </a>
              <a href="/privacy" className="block text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="block text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 pt-6 text-center">
          <p className="text-gray-400">
            © 2025 GoPrac. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;