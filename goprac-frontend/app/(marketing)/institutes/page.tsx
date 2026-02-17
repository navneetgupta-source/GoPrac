'use client';
import {
    Zap, Send, BadgeCheck, Star, MapPin, Sparkle, Target, Users, Award, Building2, Mail, Phone, User, UserCheck, Filter, LineChart, Puzzle, CheckCircle2, NotebookPen, BookOpen, TrendingUp
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ExperienceMultiSelect } from '@/components/ui/expRange-multi-select';
import { logActivity } from '@/lib/activityLogger';
import ConversionChart from '../companypage/_components/ConversionChart';
import Analytics from '../_components/analytics';
import FloatDemo from '@/components/FloatDemo';


const companyLogos = [
  '/images/institutes/srm.jpeg',
  '/images/institutes/sahyadri.svg',
  '/images/institutes/chitkara.jpeg',
  '/images/institutes/mcet.jpeg',
  '/images/institutes/pes.svg',
  '/images/institutes/gitam-logo.svg',
];


export default function Institutes() {



    const features = [
        {
            icon: <Send className="text-white" size={24} />,
            color: 'from-orange-400 to-orange-600',
            title: 'Share Opportunities',
            description: 'Receive job alerts from GoPrac and share them with your students.',
        },
        {
            icon: <Filter className="text-white" size={24} />,
            color: 'from-purple-700 to-blue-700',
            title: 'AI Screening & Shortlisting',
            description: 'Students take a 5-minute AI video interview; shortlisted profiles are sent directly to corporates.',
        },
        // {
        //     icon: <Globe className="text-white" size={24} />,
        //     color: 'from-blue-500 to-indigo-500',
        //     title: 'Global Opportunities',
        //     description: 'Access to international job opportunities worldwide with top-tier companies and remote roles.',
        // },
        {
            icon: <Zap className="text-white" size={24} />,
            color: 'from-green-500 to-emerald-600',
            title: 'Track Outcomes',
            description: 'Get detailed, student-wise reports for every job posted, helping you monitor placement progress.',
        },
    ]


    const applyButtonGradient = "bg-gradient-to-r from-orange-500 to-red-600";


    const [jobs, setJobs] = useState<Array<{
        id: string;
        preInterviewId: string;
        name: string;
        status: string;
        jobLocation: string;
        jobWorkExperience: string;
        interviewLevel: string;
        jobMatch: string; // Added jobMatch field
        // ...other fields as needed
    }>>([]);
    const [loading, setLoading] = useState(true);



    const testimonials = [
        {
            initials: 'PS',
            name: 'Priya Sharma',
            role: 'Software Engineer at Google',
            quote:
                '"GoPrac transformed my career! Found my dream job in just 2 weeks with their amazing AI matching system."',
        },
        {
            initials: 'RK',
            name: 'Rahul Kumar',
            role: 'Data Scientist at Microsoft',
            quote:
                '"The AI matching system is incredible. Perfect job recommendations every time with personalized insights."',
        },
        {
            initials: 'AP',
            name: 'Anita Patel',
            role: 'Product Manager at Amazon',
            quote:
                '"Best platform for tech professionals. Highly recommend to everyone looking for career growth!"',
        },
    ];


    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [locations, setLocations] = useState<Array<{ id: string; cityName: string }>>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [instituteName, setInstituteName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [numberOfCandidates, setNumberOfCandidates] = useState(''); // NEW FIELD
    const [contactType, setContactType] = useState(''); // Default to 'Institute'

    // Generic domains set
    const GENERIC_DOMAINS = new Set([
        "gmail.com", "googlemail.com", "yahoo.com", "yahoo.in", "yahoo.co.in", "yahoo.co.uk",
        "hotmail.com", "outlook.com", "live.com", "aol.com", "icloud.com", "mail.com",
        "rediffmail.com", "zoho.com", "protonmail.com", "gmx.com", "yandex.com", "hubspot.com",
        "mail.ru", "inbox.com", "qq.com", "163.com", "126.com", "me.com", "msn.com",
        "btinternet.com", "btconnect.com", "ntlworld.com", "shaw.ca", "comcast.net"
    ]);
    const [successMessage, setSuccessMessage] = useState('');
    const { userType, userId } = useUserStore();
    const router = useRouter();
    const formRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setLoading(true);
        setLoadingLocations(true);
        
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getCompanyInterview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menuName: 'Company Mock Interviews',
                sectorName: '',
                productId: 1,
                preInterviewId: null,
                userType: userType || '',
                interviewType: '',
                userId: userId || '',
            }),
        })
            .then(res => res.json())
            .then(data => {
                // console.log('API Response:', data);
                // console.log('Locations received:', data.locations);
                // console.log('Full API Response:', data);
                // console.log('Interviews array:', data.interviews);
                // console.log('Jobs being set:', data.interviews || []);
                
                setJobs(data.interviews || []);
                
                // Handle different possible location data structures
                if (data.locations && Array.isArray(data.locations)) {
                    setLocations(data.locations);
                } else if (data.cities && Array.isArray(data.cities)) {
                    // In case locations are under 'cities' key
                    setLocations(data.cities);
                } else {
                    // Fallback: set empty array and log warning
                    console.warn('No locations found in API response');
                    setLocations([]);
                }
                
                setLoading(false);
                setLoadingLocations(false);
            })
            .catch((error) => {
                console.error('API Error:', error);
                setLoading(false);
                setLoadingLocations(false);
                
                // Fallback locations for testing
                setLocations([
                    { id: '1', cityName: 'Mumbai' },
                    { id: '2', cityName: 'Delhi' },
                    { id: '3', cityName: 'Bangalore' },
                    { id: '4', cityName: 'Chennai' },
                    { id: '5', cityName: 'Hyderabad' },
                    { id: '6', cityName: 'Pune' },
                ]);
            });
    }, [userType, userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Let HTML5 validation handle the basic checks
        if (!e.target.checkValidity()) {
            e.target.reportValidity();
            return;
        }

        const payload = {
            instituteName,
            emailId,
            whatsappNumber: whatsappNumber.replace(/\s+/g, ""),
            contactType,
            locationId: location,
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?saveInJobMailList`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            
            // ✅ Handle exactly like your contact form
            if (data && data.result === "success") {
                setSuccessMessage("Registration successfully completed.");
                logActivity("Form_Submitted", `Institute: ${instituteName}, Email: ${emailId}`);
                // Reset form on success
                setInstituteName('');
                setEmailId('');
                setWhatsappNumber('');
                setContactType('');
                setNumberOfCandidates('');
                setExperience('');
                setLocation('');
            } else {
                setSuccessMessage("Registration failed. Please try again.");
                logActivity("Form_Submit_Failed", `Institute: ${instituteName}, Email: ${emailId}`);
            }
            
            // Auto-clear message after 10 seconds
            setTimeout(() => setSuccessMessage(""), 10000);

        } catch (error) {
            // ✅ Same state variable for error
            setSuccessMessage("Error while processing your registration. Please try again later.");
            setTimeout(() => setSuccessMessage(""), 10000);
            logActivity("Form_SUbmit_Error", `Institute: ${instituteName}, Email: ${emailId}, Error: ${error}`);
            console.error("Form submission failed:", error);
        }
    };



    const getCityName = (id) => {
        const loc = locations.find(l => l.id === id);
        return loc ? loc.cityName : 'Unknown';
    };


    return (
        <>
            {/* Section-1 (Herosection) */}
            <section className="relative w-full bg-linear-to-r from-[#f7f8f8] to-[#e5ebf5] py-16 overflow-hidden">

                <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-linear-to-br from-indigo-200/40 via-purple-200/30 to-sky-200/20 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-sky-200/35 via-blue-200/25 to-violet-200/15 blur-3xl" />
                    
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[1.3fr_minmax(0,1fr)] items-start">

                    {/* Left Section */}
                    <div className="flex flex-col gap-8 text-left">

                        <div className="space-y-4">
                            {/* <button className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 backdrop-blur-md px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
                                <Sparkle size={14} className="text-indigo-500"/> AI-Coach trained by FAANG & top-company professionals
                            </button> */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                                Build {" "}
                            <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                Industry-Ready
                            </span>
                                {" "}Graduates
                            </h1>
                            <br />
                            <span className="text-base sm:text-lg lg:text-xl tracking-normal text-gray-700">
                                Strengthen thinking skills - critical thinking and problem-solving skills with an AI- Coach trained by industry experts.
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
                            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                                300+
                                </div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Experts Insights</div>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                                5,000+
                                </div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Learners</div>
                            </div>
                            <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-lg px-2 py-4 sm:px-4 sm:py-3 text-center shadow-lg shadow-indigo-100/50">
                                <div className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                                50,500+
                                </div>
                                <div className="text-sm sm:text-base text-gray-600 mt-1 leading-tight">Training Hours</div>
                            </div>
                        </div>
                    </div>


                    {/* Right Form */}
                    <div ref={formRef} className="w-full max-w-md ml-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 space-y-2">
                        
                        <div className="flex flex-col items-center justify-center mb-4">
                            <div className="bg-[#e4f1ff] rounded-full p-2 mb-2">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-blue-600 font-semibold text-base sm:text-lg">Request a Demo</span>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate={false}>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="text-gray-400" size={20} />
                                    <label className="text-sm text-gray-700">I am:</label>
                                </div>
                                <div className="pl-7 flex gap-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contactType"
                                            value="College"
                                            checked={contactType === 'College'}
                                            onChange={(e) => setContactType(e.target.value)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                                            required
                                        />
                                        <span className="text-sm text-gray-700">College</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="contactType"
                                            value="Institute"
                                            checked={contactType === 'Institute'}
                                            onChange={(e) => setContactType(e.target.value)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                                            required
                                        />
                                        <span className="text-sm text-gray-700">Training institute</span>
                                    </label>
                                </div>
                            </div>

                            {/* Institute Name */}
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Institute Name"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                                    value={instituteName}
                                    onChange={e => setInstituteName(e.target.value)}
                                    required
                                    title="Please enter your institute name"
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="Official Email ID (example@institute.edu)"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                                    value={emailId}
                                    onChange={e => setEmailId(e.target.value)}
                                    required
                                    pattern="^[^\s@]+@(?!.*(?:gmail|yahoo|hotmail|outlook|live|aol|icloud|mail|rediffmail|zoho|protonmail|gmx|yandex|hubspot|mail\.ru|inbox|qq|163|126|me|msn|btinternet|btconnect|ntlworld|shaw|comcast)\.)[^\s@]+\.[^\s@]+$"
                                    title="Please enter a valid institutional email address (not from Gmail, Yahoo, etc.)"
                                />
                            </div>

                            {/* WhatsApp Number */}
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    placeholder="WhatsApp Number"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                                    value={whatsappNumber}
                                    onChange={e => setWhatsappNumber(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                />
                            </div>

                            {/* Location */}
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border text-gray-500 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
                                    disabled={loadingLocations}
                                    required
                                    title="Please select a location"
                                >
                                    <option value="">
                                        {loadingLocations 
                                            ? 'Loading locations...' 
                                            : locations.length === 0 
                                            ? 'No locations available' 
                                            : 'Select Location'}
                                    </option>
                                    {locations && locations.length > 0 && locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.cityName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition hover:shadow-xl"
                            >
                                <Send className="w-4 h-4 text-white" />
                                Submit
                            </button>

                        {/* DIsplay Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-center">
                                <p className="text-sm font-medium">{successMessage}</p>
                            </div>
                        )}
                        </form>

                    </div>
                </div>
            </section>


            {/* Section-2 (Why Thinking Skills Matter) */}
            <section className="bg-[#F8FAFC] py-12 px-4">
                <div className="max-w-5xl mx-auto">
                <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Why Thinking Skills Matter for Students
                    </h2>
                    <p className="text-gray-700 text-[15px] leading-relaxed mb-3 text-justify">
                    In today’s AI-driven job market, employers value how graduates think more than what they memorize. Strong thinking skills directly impact internship performance, job interview, and early career success.
                    Thinking-ready students can:
                    </p>
                    <ul className="space-y-2 text-[15px] text-gray-700 mb-6 ml-4">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Solve complex problems confidently</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Perform better in internships, projects & interviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Transition faster from classroom learning to workplace expectations</span>
                    </li>
                    </ul>
                    <div className="mt-6">
                    <p className="text-base font-semibold text-indigo-800 mb-3">
                        What research shows:
                    </p>
                    <ul className="space-y-2 text-[15px] text-gray-700 ml-4">
                        <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>
                            <a
                            onClick={() => {
                            logActivity(
                                "NTUC_REPORT_VIEWED",
                                "User viewed the NTUC LearningHub Report"
                                );
                            }}
                            href="https://tempgoprac.s3.ap-south-1.amazonaws.com/images/Special_Report_2024__Thinking_Skills.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600"
                            >
                            NTUC - LearningHub Report
                            </a>{" "}
                            : Thinking Skills strongly influence workplace productivity
                        </span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>
                            <a
                            onClick={() => {
                            logActivity(
                                "LINKEDIN_REPORT_VIEWED",
                                "User viewed the LinkedIn Report"
                                );
                            }}
                            href="https://learning.linkedin.com/resources/workplace-learning-report"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600"
                            >
                            LinkedIn - Workplace Learning Report
                            </a>{" "}
                            : Analytical and problem-solving skills are among the most in-demand globally
                        </span>
                        </li>
                        <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>
                            <a
                            onClick={() => {
                            logActivity(
                                "MCKINSEY_REPORT_VIEWED",
                                "User viewed the McKinsey Report"
                                );
                            }}
                            href="https://www.mckinsey.com/featured-insights/future-of-work/skill-shift-automation-and-the-future-of-the-workforce"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-600"
                            >
                            McKinsey - Skill Shift Report
                            </a>{" "}
                            : Demand for advanced cognitive skills will rise significantly by 2030
                        </span>
                        </li>
                    </ul>
                    </div>
                </div>
                </div>
            </section>

            {/* The Gap in Traditional Skill Training */}
            <section className="bg-linear-to-br from-[#f7f8f8] to-[#e5ebf5] py-12 px-4">
                <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                    The Gap in Traditional College Training
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                        Knowledge Over Thinking
                    </h3>
                    <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                        Curriculum, classes, and videos focus on transferring knowledge rather than building thinking capability.
                    </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-linear-to-br from-sky-50 to-blue-50 p-4 rounded-2xl">
                        <NotebookPen className="w-8 h-8 text-sky-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                        Shallow Assessment Tools
                    </h3>
                    <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                        Objective tests and coding platforms evaluate outcomes—not how candidates reason and make decisions while solving problems.
                    </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl">
                        <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                       Limited Exposure to Role Models
                    </h3>
                    <p className="text-[15px] text-gray-700 text-center leading-relaxed">
                        Students rarely get to observe how industry professionals reason and make decisions while solving problems.
                    </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-white/70 rounded-full px-5 py-2.5 w-fit mx-auto border border-indigo-200 shadow-sm">
                    <span className="text-[15px] font-semibold text-gray-800">GoPrac bridges this gap—at scale.</span>
                </div>
                </div>
            </section>


            {/* How GoPrac Works */}
            <section className="bg-linear-to-br from-[#f7f8f8] to-[#e5ebf5] py-12 px-4">
                <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">
                    How GoPrac Works for Colleges
                </h2>

                <div className="relative">
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-300 via-indigo-300 to-purple-300 transform -translate-x-1/2"></div>

                    <div className="space-y-8">
                    <div className="relative">
                        <div className="lg:flex lg:items-center">
                        <div className="lg:w-1/2 lg:pr-12 mb-4 lg:mb-0 lg:text-right">
                            <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3">
                                Practice Industry problems
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Students discuss and solve real-world problems dynamically generated based on their internship role with our AI Coach, trained by 300+ FAANG and top industry experts.
                            </p>
                            </div>
                        </div>
                        
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                            <div className="bg-linear-to-br from-blue-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                            1
                            </div>
                        </div>
                        
                        <div className="lg:w-1/2 lg:pl-12"></div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="lg:flex lg:items-start">
                        <div className="lg:w-1/2 lg:pr-12"></div>
                        
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                            <div className="bg-linear-to-br from-sky-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                            2
                            </div>
                        </div>
                        
                        <div className="lg:w-1/2 lg:pl-12">
                            <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3">
                                Thinking-Focused AI coaching
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                The AI Coach evaluates how they think—not just what they answer—and delivers personalized feedback to build core thinking skills, including:
                            </p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Problem-Solving</span> — identify true root causes
                                </div>
                                </div>
                                <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Critical Thinking</span> — question assumptions and evaluate trade-offs
                                </div>
                                </div>
                                <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Analytical Thinking</span> — compare options and spot patterns
                                </div>
                                </div>
                                <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Logical Thinking</span> — structure reasoning step by step
                                </div>
                                </div>
                                <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Systems Thinking</span> — understand interactions across components
                                </div>
                                </div>
                            </div>

                            <a
                                href="https://tempgoprac.s3.ap-south-1.amazonaws.com/images/SamplePersonlizedFeedback.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button 
                                onClick={() => {
                                    logActivity(
                                    "FEEDBACK_REPORT_VIEWED",
                                    "User clicked the sample personalized feedback button"
                                    );
                                }}                
                                className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-600 px-5 py-2 text-xs font-semibold cursor-pointer text-white shadow-sm hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                                <span>View sample personalized feedback</span>
                                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                                </button>
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="lg:flex lg:items-center">
                        <div className="lg:w-1/2 lg:pr-12 mb-4 lg:mb-0">
                            <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <h3 className="text-base sm:text-lg font-bold text-indigo-900 mb-3 lg:text-right">
                                Easy Academic Integration
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed mb-3 lg:text-right">
                                Designed to work alongside existing academic structures:
                            </p>
                            
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                                <span className="lg:text-right lg:flex-1 lg:order-1">No faculty re-training required</span>
                                </li>
                                <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                                <span className="lg:text-right lg:flex-1 lg:order-1">Can be embedded into skill courses and projects</span>
                                </li>
                                <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold mt-0.5 shrink-0 lg:order-2">•</span>
                                <span className="lg:text-right lg:flex-1 lg:order-1">Scales easily across departments and batches</span>
                                </li>
                            </ul>
                            </div>
                        </div>
                        
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                            <div className="bg-linear-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                            3
                            </div>
                        </div>
                        
                        <div className="lg:w-1/2 lg:pl-12"></div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </section>

            {/* Proven Impact for Colleges */}
            <section className="bg-white py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 rounded-3xl shadow-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Proven Impact for Colleges</h2>
                        
                        <p className="text-gray-800 text-[15px] leading-relaxed mb-5 text-center">
                        GoPrac is trusted by multiple colleges to strengthen student thinking skills and internship readiness. <br />
                        Colleges see:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                            <div className="flex items-center justify-center mb-2">
                            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            </div>
                            <p className="text-center text-sm text-gray-700 leading-tight font-medium">Better internship to offer conversion.</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
                            <div className="flex items-center justify-center mb-2">
                            <div className="bg-linear-to-br from-sky-50 to-blue-50 p-2 rounded-lg">
                                <Zap className="w-5 h-5 text-sky-600" />
                            </div>
                            </div>
                            <p className="text-center text-sm text-gray-700 leading-tight font-medium">Stronger employer feedback on student readiness</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                            <div className="flex items-center justify-center mb-2">
                            <div className="bg-linear-to-br from-indigo-50 to-purple-50 p-2 rounded-lg">
                                <Target className="w-5 h-5 text-indigo-600" />
                            </div>
                            </div>
                            <p className="text-center text-sm text-gray-700 leading-tight font-medium">Actionable, batch-level insights on thinking skills</p>
                        </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 bg-white/70 rounded-full px-5 py-2.5 w-fit mx-auto border border-indigo-200 shadow-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                            <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                            <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                            <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                            <div className="relative w-4 h-4">
                            <Star className="w-4 h-4 text-gray-300 absolute top-0 left-0" />
                            <div className="overflow-hidden absolute top-0 left-0" style={{ width: '50%' }}>
                                <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                            </div>
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Rated 4.5 / 5 by Colleges</span>
                        </div>
                        <div className="w-full pb-12 pt-6 px-4 overflow-hidden">
                        <div className="max-w-6xl mx-auto">
                            <div className="relative w-full overflow-hidden">
                                <ul className="flex items-center gap-8 py-2 animate-marquee whitespace-nowrap">
                                {companyLogos.concat(companyLogos).map((logo, idx) => (
                                    <li key={idx} className="shrink-0">
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
                        </div>
                    </div>
                    </div>
                </div>
            </section>

            {/* Program for Colleges */}
            <section className="bg-[#F8FAFC] py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Program for Colleges
                    </h2>

                    <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-lg">
                    <div className="text-center mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-2">
                        Internship Performance Accelerator
                        </h3>
                        <p className="text-sm text-gray-700 italic">
                        For final year students
                        </p>
                    </div>

                    <p className="text-[15px] sm:text-base text-gray-700 leading-relaxed mb-6 text-justify">
                        A customized program to practice thinking skills on real internship job descriptions to increase the chances of internship-to-offer conversion. It includes:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">24 industry-aligned business case studies</span>
                        </div>
                        <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">4 hours of AI-led problem discussions</span>
                        </div>
                        <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">6 hours of personalized feedback</span>
                        </div>
                        <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">Industry benchmarking report</span>
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-2xl">
                        <h4 className="text-base font-bold text-indigo-800 mb-2">Skills Developed</h4>
                        <p className="text-[15px] text-gray-700">
                        Critical thinking, problem-solving, professional confidence
                        </p>
                    </div>
                    </div>
                </div>
            </section>


            {/* Get Started */}
            <section className="bg-white py-12 sm:py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-linear-to-br from-indigo-50 via-white to-sky-50 border border-indigo-100 p-6 sm:p-8 rounded-3xl shadow-sm">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                        Get Started
                        </h2>
                        <p className="text-[15px] sm:text-base text-gray-700 leading-relaxed">
                        We work with your academic leadership and placement cell to:
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-start justify-center gap-4 md:gap-6 mb-8 max-w-4xl mx-auto">
                        <div className="flex items-start gap-3 flex-1">
                        <div className="shrink-0">
                            <div className="bg-linear-to-br from-blue-500 to-indigo-600 w-3 h-3 rounded-full mt-1.5"></div>
                        </div>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                            Understand student profiles and learning goals
                        </p>
                        </div>
                        
                        <div className="hidden md:flex items-start text-indigo-300 text-xl shrink-0 pt-1">→</div>
                        
                        <div className="flex items-start gap-3 flex-1">
                        <div className="shrink-0">
                            <div className="bg-linear-to-br from-sky-500 to-blue-600 w-3 h-3 rounded-full mt-1.5"></div>
                        </div>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                            Design a pilot for a specific batch or department
                        </p>
                        </div>
                        
                        <div className="hidden md:flex items-start text-indigo-300 text-xl shrink-0 pt-1">→</div>
                        
                        <div className="flex items-start gap-3 flex-1">
                        <div className="shrink-0">
                            <div className="bg-linear-to-br from-indigo-500 to-purple-600 w-3 h-3 rounded-full mt-1.5"></div>
                        </div>
                        <p className="text-[15px] text-gray-700 leading-relaxed">
                            Align outcomes with internship and placement readiness.
                        </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                        onClick={() => {
                            logActivity(
                            "REQUEST_DEMO_CLICKED",
                            "User clicked the Request a Demo button"
                            );

                            if (formRef.current) {
                            const rect = formRef.current.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            const offset = 96;
                            window.scrollTo({
                                top: rect.top + scrollTop - offset,
                                behavior: "smooth",
                            });
                            }
                        }}
                        className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                        <span>Request a Demo</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                    </div>
                </div>
            </section>

            {/* Section-8 (Premium Opportunities) */}
            <section className="py-12 bg-white hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Share opportunities and track student placement success
                        </p>
                    </div>

                    
                    <div className="flex justify-center"> 
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="group w-[360px] min-h-[240px] bg-white rounded-[16px] shadow-md p-8 text-left hover:shadow-xl transition-shadow duration-300"> 
                                    <button className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </button>
                                    <h3 className="text-[20px] font-bold py-2 mb-3 whitespace-nowrap">{feature.title}</h3> 
                                    <p className="text-[15px] text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* <div>
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 bg-gradient-to-r from-[#e4f1ff] to-[#f0f4ff] rounded-full px-4 py-1.5 shadow-sm mb-4">
                                <Briefcase className="w-4 h-4" />
                                Premium Jobs
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Premium Opportunities</h2>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Discover your next career milestone with curated job listings
                            </p>
                        </div> */}

                    {/* Right Side: Buttons */}
                    {/* <div className="flex gap-3">
                            <button className="border border-gray-300 text-sm px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition">
                                Search Jobs
                            </button>
                            <button className="border border-gray-300 text-sm px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition">
                                Filter
                            </button>
                        </div> */}
                    {/* </div> */}

                    {loading ? (
                        <div className="text-center py-10">Loading jobs...</div>
                    ) : (

                        <div>
                            {/* Conditional Heading - Only shows when jobs are loaded */}
                            {jobs.length > 0 && (
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Explore companies hiring now!
                                    </h3>
                                </div>
                            )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <div
                                    key={job.id + job.preInterviewId}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between min-h-[220px] space-y-4"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 justify-end">
                                            {userId && job.jobMatch === 'YES' && (
                                                <span className=" px-2  text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-300">Recommended</span>
                                            )}
                                            {job.status === 'Active' && (
                                                <span className=" px-2  text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-300">
                                                    {job.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center py-2 justify-between">
                                            <h3 className="font-semibold text-md text-gray-900">{job.name}</h3>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1 mt-2">
                                            <li>
                                                <b>Location:</b> {getCityName(job.jobLocation)}
                                            </li>
                                            <li>
                                                <b>Experience:</b> {job.jobWorkExperience}
                                            </li>
                                            {/* <li>
                                                <b>Level:</b> {job.interviewLevel}
                                            </li> */}
                                        </ul>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            className="rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 cursor-pointer"
                                            onClick={() => router.push(`/job?p=${job.preInterviewId}`)}
                                        >
                                            More Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                    {/* <div className="mt-10 flex justify-center">
                    <button className="bg-white rounded-xl border border-gray-100 text-gray-700 px-6 py-2 font-semibold shadow-lg hover:bg-gray-100 transition text-md flex items-center gap-3">
                        Explore All Opportunities <ExternalLink size={20} />
                    </button>
                    </div> */}
                </div>
            </section >


            {/* Section-4 (Success Stories) HIDDEN */}
            {/* < section className="w-full bg-[#f0f7ff] py-16 hidden" >
                <div className="container px-6 md:px-30 mx-auto text-center">
                    <div className="bg-gradient-to-br from-[#582df1] to-[#ca3ee6] rounded-2xl p-12 mb-12 mx-auto shadow-xl">
                        <span className="inline-flex items-center text-white text-sm font-medium px-3 py-2 bg-white/20 rounded-full mb-4">
                            <Star size={16} className="mr-2 text-white" /> Success Stories
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Success Stories</h2>
                        <p className="text-white text-sm md:text-base mt-3">
                            Hear from professionals who transformed their careers with GoPrac and achieved<br />their dream goals
                        </p>
                    </div>


                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl p-6 text-left bg-[#d7e2f1] text-[#1e3a8a] shadow-lg border-2 border-blue-300 bg-clip-padding transition-transform hover:-translate-y-1 hover:shadow-2xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-[#c5daf7] rounded-xl flex items-center justify-center text-[#1e3a8a] font-semibold">
                                        {item.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-[#3b5998]">{item.role}</p>
                                    </div>
                                </div>
                                <p className="italic mb-4">{item.quote}</p>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section > */}

            {/* <section className="bg-gradient-to-r from-[#f7f8f8] to-[#e5ebf5]">
                <div className="flex flex-col items-center justify-center py-8 gap-3 px-4 text-center">
                    <h1 className="text-3xl font-bold">Our Institute Partners</h1>
                </div>
                <div className="w-full pb-12 pt-6 px-4 overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative w-full overflow-hidden">
                            <ul className="flex items-center gap-8 py-2 animate-marquee whitespace-nowrap">
                            {companyLogos.concat(companyLogos).map((logo, idx) => (
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
                    </div>
                </div>
                
                <div className="text-center pb-12 px-4">
                    <button
                        className="group relative inline-flex items-center gap-2 cursor-pointer rounded-full px-7 py-2.5 text-white font-semibold text-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-lg hover:shadow-xl ring-1 ring-white/10 transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-200"
                        onClick={() => {
                            const el = document.querySelector('.w-full.max-w-md.ml-auto');
                            if (!el) return;
                            const rect = el.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            const offset = 96;
                            window.scrollTo({
                                top: rect.top + scrollTop - offset,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <span className="relative z-10">
                            Request a Demo
                        </span>
                        <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                            →
                        </span>
                    </button>
                </div>
            </section> */}

            <FloatDemo 
                targetRef={formRef}
                icon={<Send size={24} />}
                label="Book Demo"
                bgColor="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
            />
        </>
    );
}
