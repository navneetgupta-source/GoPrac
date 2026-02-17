"use client";

import { useState } from 'react';
import { ChevronDown, Users, Building, Building2 } from 'lucide-react';
import Image from "next/image"
import { logActivity } from '@/lib/activityLogger';

export default function Home() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <>
            <div className="bg-white">
                <section id="story" className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-[#8B5CF6] overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                        {/* Header */}
                        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">Our Story</h2>
                        <div className="w-16 sm:w-20 h-1 bg-blue-300 mx-auto rounded-full"></div>
                        </div>

                        {/* Content Card */}
                        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
                        {/* Left Content */}
                        <div className="order-2 lg:order-1">
                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-justify leading-relaxed">
                            We began our journey by helping engineering graduates prepare for campus interviews and assisting corporates in identifying top talent. Soon, we discovered that the real challenge wasn't just communication or technical knowledge — it was thinking skills.
                            </p>
                            
                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-justify leading-relaxed">
                            To bridge this gap, we built an <span className="font-bold text-blue-600">AI Coach</span>, powered by advanced Large Language Models (LLMs) and trained with insights from over <span className="font-bold text-indigo-600">300 industry experts</span>, including professionals from <span className="font-bold text-purple-600">FAANG and other global technology leaders.</span>
                            </p>
                            
                            <p className="text-gray-700 text-sm sm:text-base lg:text-lg text-justify leading-relaxed">
                            Our AI Coach helps software developers strengthen their thinking abilities through personalized practice sessions, AI-driven feedback, and measurable growth.
                            </p>
                        </div>

                        {/* Right Stats */}
                        <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 sm:gap-6">
                            {/* Stat 1 */}
                            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-center mb-3 sm:mb-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                <Building className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-1 sm:mb-2">
                                100+
                            </div>
                            <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium px-2">
                                Corporates trust our AI assessments
                            </div>
                            </div>

                            {/* Stat 2 */}
                            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-center mb-3 sm:mb-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                                <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-1 sm:mb-2">
                                5,000+
                            </div>
                            <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium px-2">
                                Professionals Upskilled
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Scroll Down Indicator */}
                    <button
                        onClick={() => {
                        document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-full bg-white/10 backdrop-blur-sm"
                        aria-label="Scroll to team section"
                    >
                        <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </button>
                </section>

                {/* <section id="story" className="relative py-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-[#8B5CF6]">
                    <div className="max-w-7xl mx-auto px-6 mb-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-2">Our Story</h2>
                            <div className="w-16 h-1 bg-blue-300 mx-auto"></div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center bg-white shadow-xl rounded-2xl p-10">
                            
                            <div>
                                <p className="text-gray-700 text-lg mb-6 text-justify leading-relaxed">
                                    We began our journey by helping engineering graduates prepare for campus interviews and assisting corporates in identifying top talent. Soon, we discovered that the real challenge wasn’t just communication or technical knowledge — it was thinking skills.<br /> <br />
                                    To bridge this gap, we built an <b>AI Coach</b>, powered by advanced Large Language Models (LLMs) and trained with insights from over <b>300 industry experts</b>, including professionals from <b>FAANG and other global technology leaders.</b><br /> <br />
                                    Our AI Coach helps software developers strengthen their thinking abilities through personalized practice sessions, AI-driven feedback, and measurable growth.
                                    
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                            <Building className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-900 mb-1">100+</div>
                                    <div className="text-gray-600">Corporates trust our AI assessments</div>
                                </div>

                                <div className="text-center hidden">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Building2 className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-900 mb-1">7000+</div>
                                    <div className="text-gray-600">Institutes</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                                            <Users className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-900 mb-1">5,000+</div>
                                    <div className="text-gray-600">Professionals Upskilled</div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
                        onClick={() => {
                            document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <ChevronDown className="w-8 h-8 text-white" />
                    </div>
                </section> */}

                {/* Team Section */}
                <section id="team" className="py-12 px-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900">
                                Meet our <span className="text-blue-500">team</span>
                            </h2>
                        </div>

                        <div className="space-y-16 lg:space-y-6">
                            {/* Team Member 1 - Nitin Rakesh Prasad */}
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-12">
                                <div className="w-80 h-80 mx-auto ">
                                    <Image
                                        src="/team/nitin.jpg"
                                        alt="  "
                                        width={240}
                                        height={240}
                                        className="w-60 h-60 object-cover rounded-full mx-auto"
                                    />
                                </div>
                                <div className="flex-1 text-center lg:text-left max-w-2xl">
                                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                                        <h3 className="text-3xl font-bold text-gray-900">Nitin Rakesh Prasad</h3>
                                        <a
                                            href="https://www.linkedin.com/in/nrp123/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Nitin Rakesh Prasad LinkedIn"
                                            className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center"
                                            onClick={() => {
                                                logActivity(
                                                "LINKEDIN_VISIT",
                                                "NITIN's LinkedIn profile clicked"
                                                );
                                            }}
                                        >
                                            <span className="text-white text-xs">in</span>
                                        </a>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed text-lg text-sm">
                                        Nitin, a serial entrepreneur with 20 years in technology and education, founded "The Gate Academy" in 2010, later acquired by UpGrad. He mentored 1.5 lakh students nationwide, facilitating their success in government jobs , masters & Phd programs.
                                    </p>
                                </div>
                            </div>

                            {/* Team Member 2 - Jasmeet Singh */}
                            <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-12 lg:space-x-reverse">
                                <div className="w-80 h-80 mx-auto">
                                    <Image
                                        src="/team/jasmeet.jpg"
                                        alt=" "
                                        width={240}
                                        height={240}
                                        className="w-60 h-60 object-cover rounded-full mx-auto"
                                    />
                                </div>
                                <div className="flex-1 text-center lg:text-right max-w-2xl">
                                    <div className="flex items-center justify-center lg:justify-end space-x-3 mb-6">
                                        <h3 className="text-3xl font-bold text-gray-900">Jasmeet Singh</h3>
                                        <a
                                            href="https://www.linkedin.com/in/jaysin7/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Jasmeet Singh LinkedIn"
                                            className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center"
                                            onClick={() => {
                                                logActivity(
                                                "LINKEDIN_VISIT",
                                                "JASMEET's's LinkedIn profile clicked"
                                                );
                                            }}
                                        >
                                            <span className="text-white text-xs">in</span>
                                        </a>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed text-lg text-sm">
                                        Jasmeet, a technologist with 20+ years of experience, excels in web, responsive, and cloud
                                        app development. He has delivered exceptional solutions for clients in Pharma, Life Science,
                                        Manufacturing, and Retail globally. He loves solving problems.
                                    </p>
                                </div>
                            </div>

                            {/* Team Member 3 - Sushil Harish */}
                            {/* <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-12">
                                <div className="w-80 h-80 mx-auto">
                                    <Image
                                        src="/team/sushil.jpeg"
                                        alt=" "
                                        width={240}
                                        height={240}
                                        className="w-60 h-60 object-cover rounded-full mx-auto"
                                    />
                                </div>
                                <div className="flex-1 text-center lg:text-left max-w-2xl">
                                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                                        <h3 className="text-3xl font-bold text-gray-900">Sushil Harish</h3>
                                        <a
                                            href="https://www.linkedin.com/in/shk05/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Sushil Harish LinkedIn"
                                            className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center"
                                        >
                                            <span className="text-white text-xs">in</span>
                                        </a>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed text-lg text-sm">
                                        Sushil, a seasoned HR professional with 20 years of recruitment and training experience in leading companies
                                        across India, South East Asia, and the Middle East. Proficient in strategic planning, managing large teams and P&L,
                                        and consulting various companies for Campus to Leadership roles.
                                    </p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}