"use client"

import { useState, useEffect, useRef } from "react"
import { useUserStore } from "@/stores/userStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SkillsInput } from "./skills-input";
import { ResumeUpload } from "./resume-upload"
import { LocationInput } from "./location-input"
import { MultiSelect } from "@/components/multi-select"
import { 
    User, Phone, Briefcase, Building2, Calendar, MapPin, 
    DollarSign, FileText, Award, Target, Loader2, CheckCircle 
} from "lucide-react"
import { toast } from "sonner"


interface ProfessionalDetailsTabProps {
    userId: string;
    domains: any;
    subjects: any;
    qualifications: any;
    specializations: any;
    colleges: any;
    progSkills: any;
    companies: any;
    languages: any;
    professionalDetails: any;
    userDetails: any;
}


const defaultFormData = {
    firstName: "",
    gender: "",
    mobileNumber: "",
    instituteCode: "",
    workExperience: "",
    currentCompany: "",
    employmentStatus: "",
    noticePeriod: "",
    // lastWorkingDay removed, use noticePeriod for all statuses
    currentLocation: "",
    currentSalary: "",
    expectedSalary: "",
    skills: [] as any[],
    hasOffer: "no",
    offeredCTC: "",
    outstationDeclaration: false,
    resume: ""
};

// Format salary with commas
const formatSalary = (value: string) => {
    const digitsOnly = value.replace(/,/g, '');
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function ProfessionalDetailsTab({
    userId,
    domains,
    subjects,
    qualifications,
    specializations,
    colleges,
    progSkills,
    companies,
    languages,
    professionalDetails,
    userDetails,
}: ProfessionalDetailsTabProps) {
    // Use userStore for userData (cookie value)
    const userData = useUserStore((state) => state.jwtToken);
    const setUser = useUserStore((state) => state.setUser);
    // On mount, if jwtToken is not set, read from cookie and set in store
    useEffect(() => {
        if (!userData && typeof document !== "undefined") {
            const match = document.cookie.match(/_GP_=([^;]+)/);
            const cookieValue = match ? decodeURIComponent(match[1]) : "0";
            setUser({ jwtToken: cookieValue });
        }
    }, [userData, setUser]);
    const [formData, setFormData] = useState(() => {
        if (professionalDetails) {
            const info = professionalDetails;
            let skillsArr: any[] = [];
            if (info.skillList && info.skills) {
                const skillIds = info.skills.split(',');
                skillsArr = info.skillList
                    .filter((skill: any) => skillIds.includes(skill.id.toString()))
                    .map((skill: any) => ({ id: skill.id, name: skill.name }));
            }
            return {
                ...defaultFormData,
                firstName: info.firstName || "",
                gender: info.gender || "",
                mobileNumber: info.mobileNumber || "",
                instituteCode: info.instituteCode || "",
                workExperience: info.workExperience?.toString() || "",
                currentCompany: info.currentCompany || "",
                employmentStatus: info.employmentStatus || "",
                noticePeriod: info.noticePeriod || "",
                lastWorkingDay: info.lastWorkingDay || "",
                // If both id and cityName are available, store as object for LocationInput
                currentLocation: (info.currentLocationCityName)
                    ? { id: info.currentLocationId || info.currentLocation, cityName: info.currentLocationCityName }
                    : ((info.currentLocationId && (info.currentLocationCityName || info.currentLocationName))
                        ? { id: info.currentLocationId, cityName: info.currentLocationCityName || info.currentLocationName }
                        : ((typeof info.currentLocation === 'number' || (typeof info.currentLocation === 'string' && /^\d+$/.test(info.currentLocation)))
                            ? info.currentLocation
                            : (info.currentLocationId || info.currentLocation || ""))),
                currentSalary: info.salary || "",
                expectedSalary: info.expectedSalary || "",
                skills: skillsArr,
                hasOffer: info.offer || "no",
                offeredCTC: info.offeredCTC || "",
                outstationDeclaration: info.outstationDeclaration === "Y",
                resume: info.resume || ""
            };
        }
        return { ...defaultFormData };
    });
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
        // const [isLoadingData, setIsLoadingData] = useState(true)
    const [isValidInstituteCode, setIsValidInstituteCode] = useState(true)
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
    const formRef = useRef<HTMLFormElement>(null)
    const skillsList = Array.from(
        new Map(
            (subjects as any[])
                .map((subject) => ({
                    id: subject.id,
                    name: subject.favourite_subject || subject.name
                }))
                .map((subject) => [subject.id, subject])
        ).values()
    )
    // Removed useEffect and fetchProfessionalInfo. All data comes from props.
    // ...existing logic...

        // No need for lastWorkingDay syncing, only noticePeriod is used


    // Update handleInputChange to accept location object
    const handleInputChange = (field: string, value: string | string[] | boolean | any[] | { id: string | number; cityName: string }) => {
        setFormData(prev => {
            // Employment status logic for noticePeriod
            if (field === "employmentStatus") {
                if (value === "employed") {
                    return { ...prev, employmentStatus: value, noticePeriod: "" };
                } else if (value === "unemployed" || value === "servingNotice") {
                    return { ...prev, employmentStatus: value, noticePeriod: "" };
                } else if (value === "" || value === "none") {
                    return { ...prev, employmentStatus: "", noticePeriod: "" };
                }
            }
            return { ...prev, [field]: value };
        });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
        // Mark step as completed
        if (Array.isArray(value) ? value.length > 0 : !!value) {
            setCompletedSteps(prev => new Set([...prev, field]));
        } else {
            setCompletedSteps(prev => {
                const newSet = new Set(prev);
                newSet.delete(field);
                return newSet;
            });
        }
    };

    const handleSkillsChange = (skills: any[]) => {
        setFormData(prev => ({ ...prev, skills }))
        if (errors.skills) {
            setErrors(prev => ({ ...prev, skills: "" }))
        }
    }

    const handleResumeUpload = (resumeUrl: string) => {
        setFormData(prev => ({ ...prev, resume: resumeUrl }))
        if (errors.resume) {
            setErrors(prev => ({ ...prev, resume: "" }))
        }
    }

    const validateInstituteCode = async () => {
        if (!formData.instituteCode.trim()) {
            setIsValidInstituteCode(true)
            setErrors(prev => ({ ...prev, instituteCode: "" }))
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?checkInstituteCode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    instituteCode: formData.instituteCode.trim() 
                }),
            })

            const data = await response.json()
            if (!data.exists) {
                setIsValidInstituteCode(false)
                setErrors(prev => ({ ...prev, instituteCode: "Invalid College Code." }))
            } else {
                setIsValidInstituteCode(true)
                setErrors(prev => ({ ...prev, instituteCode: "" }))
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, instituteCode: "Unable to verify code, try again later." }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = "Please enter your name";
        }
        // Gender is optional now
        const mobilePattern = /^([6-9][0-9]{9})$/;
        if (!formData.mobileNumber || !mobilePattern.test(formData.mobileNumber)) {
            newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
        }
        if (formData.instituteCode && !isValidInstituteCode) {
            newErrors.instituteCode = "Please enter a valid institute code";
        }
        const skills = formData.skills.filter((s: any) => s.id >= 0);
        if (skills.length === 0) {
            newErrors.skills = "Please add at least one skill";
        }
        if (!formData.workExperience) {
            newErrors.workExperience = "Please enter your work experience";
        } else if (parseFloat(formData.workExperience) > 60) {
            newErrors.workExperience = "Work experience cannot be more than 60 years";
        }
        const currentSalaryDigits = formData.currentSalary.replace(/,/g, '');
        if (formData.workExperience === "0") {
            if (currentSalaryDigits === "" || currentSalaryDigits == null) {
                newErrors.currentSalary = "Enter Current Salary";
            }
        } else {
            if (currentSalaryDigits === "" || currentSalaryDigits == null) {
                newErrors.currentSalary = "Enter Your Current Salary";
            } else if (parseFloat(currentSalaryDigits) < 100000) {
                newErrors.currentSalary = "Current salary should be at least 1 Lakh PA";
            }
        }
        const expectedSalaryDigits = formData.expectedSalary.replace(/,/g, '');
        if (expectedSalaryDigits && parseFloat(expectedSalaryDigits) < 100000) {
            newErrors.expectedSalary = "Expected salary should be at least 1 Lakh PA";
        }
        // Validate noticePeriod for all employment status cases
        if (formData.employmentStatus === "employed") {
            if (!formData.noticePeriod) {
                newErrors.noticePeriod = "Please select notice period";
            }
        } else if (formData.employmentStatus === "unemployed" || formData.employmentStatus === "servingNotice") {
            if (!formData.noticePeriod) {
                newErrors.noticePeriod = "Please select date";
            }
        }
        if (formData.hasOffer === "yes" && !formData.offeredCTC) {
            newErrors.offeredCTC = "Please enter offered CTC";
        }
        if (!formData.resume) {
            newErrors.resume = "Please upload your resume";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            let element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            // Special handling for skills error: scroll to the skills input container
            if (!element && firstErrorField === "skills") {
                // Try to find the SkillsInput container by label or class
                element = document.querySelector('.skills-input-container') as HTMLElement;
                // fallback: try to find the input inside SkillsInput
                if (!element) {
                    element = document.querySelector('input[placeholder*="skill" i]') as HTMLElement;
                }
            }
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.focus();
            }
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleDownloadPDF = async () => {
        // Import libraries dynamically
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).jsPDF;

        const commaSeparatedSkills = formData.skills.map(s => s.name).join(", ");

        let employmentStatusText = "";
        if (formData.employmentStatus === "employed") {
            employmentStatusText = "Employed";
        } else if (formData.employmentStatus === "unemployed") {
            employmentStatusText = "Unemployed";
        } else if (formData.employmentStatus === "servingNotice") {
            employmentStatusText = "Serving Notice Period";
        }

        let offerText = formData.hasOffer === "yes" ? "Yes" : "No";

        const PD_DATA = [
            { key: "id", label: "Candidate ID", value: userId },
            { key: "name", label: "Candidate Name", value: formData.firstName },
            { key: "skills", label: "Candidate Skills", value: commaSeparatedSkills },
            { key: "workexperience", label: "Work Experience", value: formData.workExperience },
            { key: "salary", label: "Current Salary", value: formData.currentSalary },
            { key: "expectedSalary", label: "Expected Salary", value: formData.expectedSalary },
        ];

        const EM_DATA = [
            { key: "employmentStatus", label: "What is your current employment status?", value: employmentStatusText },
            { key: "noticePeriod", label: "What is your official notice period?", value: formData.noticePeriod },
            { key: "currentCompany", label: "What is your current company?", value: formData.currentCompany },
            { key: "offer", label: "Do you currently hold any offer?", value: offerText },
            { key: "offeredCTC", label: "If Yes, What is the Offered CTC?", value: formData.offeredCTC },
            { key: "outstationDeclaration", label: "Are you ready to relocate?", value: formData.outstationDeclaration ? "Y" : "N" },
        ];

        const content = `<div style="font-size: 1rem; font-family: system-ui, -apple-system, sans-serif; color: #333; background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); margin: 0 0; padding: 1.5rem;">
        <div style="text-align: center; margin-bottom: 2rem; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <img src="https://tempgoprac.s3.ap-south-1.amazonaws.com/images/logo1.png" alt="GoPrac Logo" style="max-width: 200px; height: auto; margin-bottom: 1rem;">
        </div>
        <div style="background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-bottom: 1rem; border: 1px solid rgba(244, 145, 47, 0.1);">
            <div style="color: #f4912f; margin-bottom: 1.5rem; font-size: 1.2rem; font-weight: 600;margin-bottom: 2rem; letter-spacing: 0.5px;">Professional Details</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                ${PD_DATA.map(item => `<div style="display: flex; flex-direction: column; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-weight: 600; font-size: 0.9rem; color: #666; margin-bottom: 0.1rem; letter-spacing: 0.5px;">${item.label}:</div>
                    <div style="font-size: 0.9rem; margin-bottom: 1rem; font-weight: 500; margin: 0; color: #2d3748; letter-spacing: 0.5px;">${item.value}</div>
                </div>`).join("")}
            </div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid rgba(244, 145, 47, 0.1);">
            <div style="color: #f4912f; margin-bottom: 1.5rem; font-size: 1.2rem; font-weight: 600;margin-bottom: 2rem; letter-spacing: 0.5px;">Employment Details</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                ${EM_DATA.map(item => `<div style="display: flex; flex-direction: column; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                    <span style="font-weight:600; font-size: 0.9rem; color: #666; margin-bottom: 0.1rem; letter-spacing: 0.5px;">${item.label}</span>
                    <span style="font-size: 0.9rem; margin-bottom: 1rem; font-weight: 500; margin: 0; color: #2d3748; letter-spacing: 0.5px;">${item.value}</span>
                </div>`).join("")}
            </div>
            <div style="display: flex; flex-direction: column; padding: 0.5rem; background: #f8f9fa; border-radius: 8px; margin-top: 1rem">
                <span style="font-weight:600; font-size: 0.9rem; color: #666; margin-bottom: 0.1rem; letter-spacing: 0.5px;">Resume Link</span>
                <a href="${formData.resume}" style="font-size: 1.1rem; margin-bottom: 1rem; color: #3498db; text-decoration: none; font-size: 10px; letter-spacing: 0.5px;">${formData.resume}</a>
            </div>
        </div>
    </div>`;

        const filename = `${userId}_${formData.firstName}.pdf`;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = content;
        wrapper.style.position = "absolute";
        wrapper.style.top = "-9999px";
        wrapper.style.width = "210mm";
        document.body.appendChild(wrapper);

        html2canvas(wrapper, { useCORS: true }).then((canvas) => {
            const pdf = new jsPDF("portrait", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas.toDataURL("image/jpeg", 0.7), "JPEG", 0, 0, imgWidth, imgHeight);
            pdf.save(filename);
            document.body.removeChild(wrapper);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const skillIds = formData.skills
            .filter((s: any) => s.id >= 0)
            .map((s: any) => s.id)
            .join(",");

        // Determine final institute code value
        let instituteCodeFinal: string | null = null
        if (formData.instituteCode && isValidInstituteCode) {
            instituteCodeFinal = formData.instituteCode
        }

        // Always send emailId from userDetails prop
        let emailId = "";
        if (userDetails?.emailId) {
            emailId = userDetails.emailId;
        }

        // Always send only the location ID (string or number) as currentLocation
        let currentLocation = "";
        if (typeof formData.currentLocation === 'object' && formData.currentLocation !== null && formData.currentLocation.id) {
            currentLocation = String(formData.currentLocation.id);
        } else if (typeof formData.currentLocation === 'string' && /^\d+$/.test(formData.currentLocation)) {
            currentLocation = formData.currentLocation;
        } else if (typeof formData.currentLocation === 'number') {
            currentLocation = String(formData.currentLocation);
        }

        const payload = {
            userData: decodeURIComponent(userData ?? ""),
            emailId: emailId,
            workexperience: formData.workExperience,
            currentCompany: formData.currentCompany,
            employmentStatus: formData.employmentStatus,
            noticePeriod: formData.noticePeriod,
            currentLocation: currentLocation,
            currentSalary: formData.currentSalary.replace(/,/g, ''),
            expectedSalary: formData.expectedSalary.replace(/,/g, ''),
            resume: formData.resume,
            skills: skillIds,
            briefSummary: null,
            offer: formData.hasOffer,
            offeredCTC: formData.offeredCTC.replace(/,/g, ''),
            outstationDeclaration: formData.outstationDeclaration === true ? "Y" : (formData.outstationDeclaration === false ? "N" : ""),
            firstName: formData.firstName,
            gender: formData.gender,
            mobileNumber: formData.mobileNumber,
            roleId: null,
            subjectId: null,
            instituteCode: instituteCodeFinal
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?updateProfessionalInfo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json();
            const status = data.status;
            // Success
            if (status === "1") {
                toast.success(data.response || "Professional details updated successfully!");
            }
            // Field validation error
            else if (status === "-99") {
                toast.error(data.errorCode || "Some fields are not valid.");
            }
            // General error
            else if (status === "-1") {
                toast.error(data.errorCode || data.response || "Professional information update failed.");
            }
            // Fallback
            else {
                toast.error("There is an error. Please try again later");
            }
        } catch (error) {
            console.error("Error updating professional info:", error);
            toast.error("An error occurred while updating professional details");
        } finally {
            setIsLoading(false);
        }
    }



    // Removed loading data conditional render

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-white via-blue-50 to-white border-b px-4 py-2 md:px-6 md:py-3 mt-0">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">Professional Details</CardTitle>
            </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    
                    {/* Candidate ID */}
                    <div className="flex gap-2 mb-4">
                        <span className="font-bold">Candidate Id:</span>
                        <span className="font-bold">{userId}</span>
                    </div>

                    {/* Name and Gender Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        <div className="col-span-1 md:col-span-2 space-y-1 w-full">
                            <Label htmlFor="firstName" className="font-semibold">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                className="h-9 md:h-10 text-sm md:text-base w-full"
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-xs">{errors.firstName}</p>
                            )}
                        </div>
                        <div className="col-span-1 space-y-1 w-full">
                            <Label htmlFor="gender" className="font-semibold">Gender</Label>
                            <Select
                                value={formData.gender || "none"}
                                onValueChange={val => handleInputChange("gender", val === "none" ? "" : val)}
                            >
                                <SelectTrigger className="h-9 md:h-10 text-sm md:text-base w-full" name="gender" id="gender">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select Gender</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Transgender">Transgender</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-red-500 text-xs">{errors.gender}</p>
                            )}
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                        <Label htmlFor="mobileNumber" className="font-semibold">
                            Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex">
                            <div className="px-3 inline-flex items-center bg-gray-50 border border-r-0 rounded-l">
                                <span className="text-sm">+91</span>
                            </div>
                            <Input
                                id="mobileNumber"
                                name="mobileNumber"
                                type="number"
                                placeholder="10 Digit Mobile Number"
                                value={formData.mobileNumber}
                                onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                                className="h-9 md:h-10 text-sm md:text-base rounded-l-none"
                            />
                        </div>
                        {errors.mobileNumber && (
                            <p className="text-red-500 text-xs">{errors.mobileNumber}</p>
                        )}
                    </div>

                    {/* Institute Code */}
                    <div className="space-y-1">
                        <Label htmlFor="instituteCode" className="font-semibold">
                            College Code <span className="text-xs text-gray-500 italic font-normal">(Optional)</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="instituteCode"
                                name="instituteCode"
                                placeholder="College Code"
                                value={formData.instituteCode}
                                onChange={(e) => handleInputChange("instituteCode", e.target.value)}
                                onBlur={validateInstituteCode}
                                className={`h-9 md:h-10 text-sm md:text-base ${formData.instituteCode && isValidInstituteCode ? 'border-green-500' : formData.instituteCode && !isValidInstituteCode ? 'border-red-500' : ''}`}
                            />
                            {formData.instituteCode && isValidInstituteCode && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-xl">✔</span>
                            )}
                            {formData.instituteCode && !isValidInstituteCode && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xl">✖</span>
                            )}
                        </div>
                        {errors.instituteCode && (
                            <p className="text-red-500 text-xs">{errors.instituteCode}</p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <Label className="block text-base md:text-lg font-semibold mb-1 md:mb-2">
                            <span>Add Skills that best represent your expertise,</span>
                            <span className="font-normal ml-1">such as Oracle, Java, SQL, etc.</span>
                            <span className="font-normal ml-1">(Minimum of 1)</span>
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="w-full">
                            <SkillsInput 
                                skillsList={skillsList} 
                                onSkillsChange={handleSkillsChange}
                                initialSkills={formData.skills}
                            />
                        </div>
                        {errors.skills && (
                            <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
                        )}
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-1">
                        <Label htmlFor="workExperience" className="font-semibold">
                            Years of Experience <span className="font-normal">(Don't include internships)</span> <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="workExperience"
                            name="workExperience"
                            type="number"
                            step="0.1"
                            placeholder="Years of Experience"
                            value={formData.workExperience}
                            onChange={(e) => handleInputChange("workExperience", e.target.value)}
                            className="h-9 md:h-10 text-sm md:text-base"
                        />
                        {errors.workExperience && (
                            <p className="text-red-500 text-xs">{errors.workExperience}</p>
                        )}
                    </div>

                    {/* Current Salary */}
                    <div className="space-y-1">
                        <Label htmlFor="currentSalary" className="font-semibold">
                            Current Salary <span className="font-normal">(Add 0 for Fresher)</span> <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="currentSalary"
                                name="currentSalary"
                                placeholder="e.g. 1200000"
                                value={formData.currentSalary}
                                onChange={(e) => {
                                    const formatted = formatSalary(e.target.value)
                                    handleInputChange("currentSalary", formatted)
                                }}
                                className="h-9 md:h-10 text-sm md:text-base pl-7 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">PA</span>
                        </div>
                        {errors.currentSalary && (
                            <p className="text-red-500 text-xs">{errors.currentSalary}</p>
                        )}
                    </div>

                    {/* Expected Salary */}
                    <div className="space-y-1">
                        <Label htmlFor="expectedSalary" className="font-semibold">
                            Expected Salary
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                                id="expectedSalary"
                                name="expectedSalary"
                                placeholder="e.g. 1500000"
                                value={formData.expectedSalary}
                                onChange={(e) => {
                                    const formatted = formatSalary(e.target.value)
                                    handleInputChange("expectedSalary", formatted)
                                }}
                                className="h-9 md:h-10 text-sm md:text-base pl-7 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">PA</span>
                        </div>
                        {errors.expectedSalary && (
                            <p className="text-red-500 text-xs">{errors.expectedSalary}</p>
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* Employment Details */}
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Employment Details
            </div>

            <Card className="border shadow-md">
                <CardContent className="p-3 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        {/* Employment Status */}
                        <div className="space-y-1">
                            <Label className="font-semibold">What is your current employment status?</Label>
                            <Select
                                value={formData.employmentStatus || "none"}
                                onValueChange={val => handleInputChange("employmentStatus", val === "none" ? "" : val)}
                            >
                                <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                                    <SelectValue placeholder="Select Employment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select Employment Status</SelectItem>
                                    <SelectItem value="employed">Employed</SelectItem>
                                    <SelectItem value="unemployed">Unemployed</SelectItem>
                                    <SelectItem value="servingNotice">Serving Notice Period</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.employmentStatus && (
                                <p className="text-red-500 text-xs">{errors.employmentStatus}</p>
                            )}
                        </div>

                        {/* Notice Period or Last Working Day */}
                        {formData.employmentStatus === "employed" && (
                            <div className="space-y-1">
                                <Label className="font-semibold">What is your official notice period? <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={formData.noticePeriod} 
                                    onValueChange={(value) => handleInputChange("noticePeriod", value)}
                                >
                                    <SelectTrigger className="h-9 md:h-10 text-sm md:text-base" name="noticePeriod" id="noticePeriod">
                                        <SelectValue placeholder="Select Notice Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15 Days">15 Days</SelectItem>
                                        <SelectItem value="30 Days">30 Days</SelectItem>
                                        <SelectItem value="45 Days">45 Days</SelectItem>
                                        <SelectItem value="60 Days">60 Days</SelectItem>
                                        <SelectItem value="90 Days">90 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.noticePeriod && (
                                    <p className="text-red-500 text-xs">{errors.noticePeriod}</p>
                                )}
                            </div>
                        )}

                        {["unemployed", "servingNotice"].includes(formData.employmentStatus) && (
                            <div className="space-y-1">
                                <Label className="font-semibold">
                                    {formData.employmentStatus === "unemployed" 
                                        ? "When was your last working day?" 
                                        : "When is your last working day?"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="noticePeriod"
                                    name="noticePeriod"
                                    type="date"
                                    value={formData.noticePeriod}
                                    onChange={(e) => handleInputChange("noticePeriod", e.target.value)}
                                    className="h-9 md:h-10 text-sm md:text-base"
                                />
                                {errors.noticePeriod && (
                                    <p className="text-red-500 text-xs">{errors.noticePeriod}</p>
                                )}
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Warning: </span>
                                    {formData.employmentStatus === "unemployed" 
                                        ? "If selected for a face-to-face interview, you will be required to produce your relieving letter. Failure to do so will result in rejection of your candidature."
                                        : "If selected for a face-to-face interview, you will be required to produce your resignation acceptance letter. Failure to do so will result in rejection of your candidature."}
                                </p>
                            </div>
                        )}

                        {/* Current Company */}
                        <div className="space-y-1">
                            <Label className="font-semibold">What is your current company?</Label>
                            <Input
                                id="currentCompany"
                                placeholder="e.g. Amazon"
                                value={formData.currentCompany}
                                onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                                className="h-9 md:h-10 text-sm md:text-base"
                            />
                        </div>

                        {/* Current Location */}
                        <div className="space-y-1">
                            <Label className="font-semibold">Where are you currently located?</Label>
                            <LocationInput
                                value={formData.currentLocation}
                                onChange={(value) => handleInputChange("currentLocation", value)}
                            />
                        </div>

                        {/* Offer Status */}
                        <div className="space-y-1">
                            <Label className="font-semibold">Do you currently hold any offer?</Label>
                            <Select value={formData.hasOffer} onValueChange={(value) => handleInputChange("hasOffer", value)}>
                                <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Offered CTC */}
                        {formData.hasOffer === "yes" && (
                            <div className="space-y-1">
                                <Label className="font-semibold">If Yes, What is the Offered CTC</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <Input
                                        id="offeredCTC"
                                        name="offeredCTC"
                                        placeholder="e.g. 1200000"
                                        value={formData.offeredCTC}
                                        onChange={(e) => {
                                            const formatted = formatSalary(e.target.value)
                                            handleInputChange("offeredCTC", formatted)
                                        }}
                                        className="h-12 md:h-14 text-base md:text-lg rounded-xl border-gray-300 focus:border-blue-500 shadow-sm px-4 pl-7 pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">PA</span>
                                </div>
                                {errors.offeredCTC && (
                                    <p className="text-red-500 text-xs">{errors.offeredCTC}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Ready to Relocate */}
                    <div className="mt-3 flex items-center gap-6">
                        <span className="font-semibold">Are you ready to Relocate?</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                id="outstationDeclarationYes"
                                checked={formData.outstationDeclaration === true}
                                onCheckedChange={() => handleInputChange("outstationDeclaration", formData.outstationDeclaration === true ? "" : true)}
                                className="accent-orange-500"
                            />
                            <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                id="outstationDeclarationNo"
                                checked={formData.outstationDeclaration === false}
                                onCheckedChange={() => handleInputChange("outstationDeclaration", formData.outstationDeclaration === false ? "" : false)}
                                className="accent-orange-500"
                            />
                            <span>No</span>
                        </label>
                    </div>

                    {/* Resume */}
                    <div className="mt-6 md:mt-8 space-y-2 md:space-y-3">
                        <Label>Upload your latest resume <span className="text-red-500">*</span></Label>
                        <ResumeUpload
                            userId={userId}
                            userName={formData.firstName}
                            currentResume={formData.resume}
                            onUploadComplete={handleResumeUpload}
                        />
                        {errors.resume && (
                            <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-6 md:mt-8">
                        <div className="flex flex-row gap-3 w-full sm:w-auto justify-center">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 md:px-8 py-2 md:py-4 rounded-xl shadow-lg text-base md:text-lg font-semibold cursor-pointer w-fit transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDownloadPDF}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 md:px-8 py-2 md:py-4 rounded-xl shadow-lg text-base md:text-lg font-semibold cursor-pointer w-fit transition-all"
                            >
                                Download as PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}