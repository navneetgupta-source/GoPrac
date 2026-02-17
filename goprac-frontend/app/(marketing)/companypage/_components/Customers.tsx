'use client'
import React from 'react';

const companyLogos = [
  '../images/company/purview-logo-blue.png',
  '../images/company/phicomerceLOgo.png',
  '../images/company/thertroLabs_32.png',
  '../images/company/RightData_Logo.jpg',
  '../images/company/exrinctFire.jfif',
  '../images/company/pageSuite.jfif',
  '../images/company/genzeon-logo.png',
  '../images/company/allsec.png',
  '../images/company/axeno_logo.jfif',
  '../images/company/exa_ag.jfif',
  '../images/company/archon_logo.jfif',
  '../images/company/TIM.png',
  '../images/company/MBM_Newtech.png',
  '../images/company/Intelizen.jfif',
  '../images/company/morph.jfif',
  '../images/company/sartorious_logo_2.png',
  '../images/company/pxil_india_logo.jfif',
  '../images/company/nippon.png',
  '../images/company/boot.jfif',
  '../images/company/veenaworld.png',
  '../images/company/digitinsurance.png',
  '../images/company/GigaforceLogo.jpg',
];

export default function Customers() {
  return (
    <section className="py-12 bg-gradient-to-r from-[#f7f8f8] to-[#e5ebf5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Corporate Partners
          </h2>
          {/* <p className="text-xl text-gray-600">
            Trusted by leading companies across industries
          </p> */}
        </div>
        <div className="overflow-hidden w-full">
          <ul className="flex items-center gap-8 py-2 animate-marquee whitespace-nowrap">
            {[...companyLogos, ...companyLogos].map((logo, idx) => (
              <li key={idx} className="flex-shrink-0">
                <div className="w-28 h-20 rounded-2xl flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Company logo"
                    className="max-h-16 max-w-[100px] object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* <div className="text-center mt-12">
          <p className="text-gray-500">
            Join hundreds of companies who trust GoPrac for their hiring needs
          </p>
        </div> */}
      </div>
    </section>
  );
}