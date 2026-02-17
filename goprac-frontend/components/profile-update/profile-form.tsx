"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkillsInput } from "./skills-input"
import { Phone, Briefcase, Target, Award, User, LogOut, CheckCircle } from "lucide-react"
import { QueryResult } from "mysql2"
import { useUserStore } from "@/stores/userStore";

import { MultiSelect } from "@/components/multi-select";

interface ProfileFormProps {
    domains: QueryResult
    subjects: QueryResult
}

export function ProfileForm({ domains, subjects }: ProfileFormProps) {
    const router = useRouter();
    const setIsProfileUpdated = useUserStore((state) => state.setIsProfileUpdated);
    const userId = useUserStore((state) => state.userId);
    const [formData, setFormData] = useState({
        mobileNumber: "",
        workExperience: "",
        domain: "",
        competencySubject: [],
        skills: [],
    })
    console.log("formData:", formData)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())


    const mobileRef = useRef<HTMLInputElement>(null);
    const workExpRef = useRef<HTMLInputElement>(null);
    const domainRef = useRef<HTMLInputElement>(null); 
    const competencyRef = useRef<HTMLDivElement>(null);
    const skillsRef = useRef<HTMLDivElement>(null);



    const skillsList = Array.from(
        new Map(
            (subjects as any[])
                .filter((subject) => subject.subjectType !== "competency")
                .map((subject) => [subject.id, subject])
        ).values()
    );

    const competencies = (subjects as any[]).filter(
        (subject) => subject.subjectType === "competency" && subject.roleId === formData.domain
    );



    // const handleInputChange = (field: string, value: string) => {
    //     setFormData((prev) => ({ ...prev, [field]: value }))
    //     if (errors[field]) {
    //         setErrors((prev) => ({ ...prev, [field]: "" }))
    //     }

    //     console.log("value:", value)

    //     // Mark step as completed if field has value
    //     if (value) {
    //         setCompletedSteps((prev) => new Set([...prev, field]))
    //     } else {
    //         setCompletedSteps((prev) => {
    //             const newSet = new Set(prev)
    //             newSet.delete(field)
    //             return newSet
    //         })
    //     }
    // }



    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }

        // Mark step as completed if field has value
        if (Array.isArray(value) ? value.length > 0 : !!value) {
            setCompletedSteps((prev) => new Set([...prev, field]))
        } else {
            setCompletedSteps((prev) => {
                const newSet = new Set(prev)
                newSet.delete(field)
                return newSet
            })
        }
    }

    const handleSkillsChange = (skills: any[]) => {
        setFormData((prev) => ({ ...prev, skills }))
        if (errors.skills) {
            setErrors((prev) => ({ ...prev, skills: "" }))
        }

        if (skills.length > 0) {
            setCompletedSteps((prev) => new Set([...prev, "skills"]))
        } else {
            setCompletedSteps((prev) => {
                const newSet = new Set(prev)
                newSet.delete("skills")
                return newSet
            })
        }
    }



    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
            newErrors.mobileNumber = "Please enter a valid 10-digit mobile number"
        }

        if (!formData.workExperience) {
            newErrors.workExperience = "Please enter your work experience"
        } else if (parseFloat(formData.workExperience) > 60) {
            newErrors.workExperience = "Work Experience cannot be more than 60 years."
        }

        if (!formData.domain) {
            newErrors.domain = "Please select your domain"
        }

        if (formData.competencySubject.length === 0) {
            newErrors.competencySubject = "Please select at least one competency"
        }

        if (formData.skills.length === 0) {
            newErrors.skills = "Please add at least one skill"
        }

        setErrors(newErrors)
        // Scroll to first error
        if (newErrors.mobileNumber && mobileRef.current) {
            mobileRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            mobileRef.current.focus();
        } else if (newErrors.workExperience && workExpRef.current) {
            workExpRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            workExpRef.current.focus();
        } else if (newErrors.domain && domainRef.current) {
            domainRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            domainRef.current.focus();
        } else if (newErrors.competencySubject && competencyRef.current) {
            competencyRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (newErrors.skills && skillsRef.current) {
            skillsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return;
        const skillIds = formData.skills
            .filter((s) => s.id && s.id !== -1)
            .map((s) => s.id)
            .join(",");

        if (!userId) return;

        const payload = {
            userId: userId,
            mobileNumber: formData.mobileNumber,
            workExperience: formData.workExperience,
            roleId: formData.domain,
            subjectId: formData.competencySubject.join(","),
            skills: skillIds,
        };

        console.log("Submitting profile data:", payload);

        // return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?personalDetailsSection`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.status === 1) {
                // alert("Profile saved successfully");
                setIsProfileUpdated('Y');  // update store for isProfileUpdated
                router.refresh();
            } else {
                alert(result.errorCode || "Something went wrong");
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Failed to save profile");
        }



    }

    const progressPercentage = (completedSteps.size / 5) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-600">Help us understand your professional background</p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-46 space-y-6">


                        {/* Mobile Number Card */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                    Mobile Number
                                    {completedSteps.has("mobileNumber") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex rounded-xl shadow-sm border-2 border-gray-100 focus-within:border-blue-500 transition-colors">
                                        <div className="px-4 inline-flex items-center min-w-fit rounded-s-xl bg-gray-50 border-r">
                                            <span className="text-sm font-medium text-gray-700">+91</span>
                                        </div>
                                        <Input
                                            ref={mobileRef}
                                            type="number"
                                            className="border-0 rounded-s-none focus-visible:ring-0 text-lg"
                                            placeholder="10 Digit Mobile Number"
                                            value={formData.mobileNumber}
                                            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                                        />
                                    </div>
                                    {errors.mobileNumber && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.mobileNumber}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Experience Card */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Briefcase className="w-5 h-5 text-green-600" />
                                    </div>
                                    Work Experience
                                    {completedSteps.has("workExperience") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                                <p className="text-sm text-gray-600">Don't include internships</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            ref={workExpRef}
                                            type="number"
                                            step="1"
                                            className="text-lg border-2 border-gray-100 rounded-xl focus-visible:border-green-500 pr-16"
                                            placeholder="Years of Experience"
                                            value={formData.workExperience}
                                            onChange={(e) => handleInputChange("workExperience", e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-4">
                                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                                                Years
                                            </Badge>
                                        </div>
                                    </div>
                                    {errors.workExperience && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.workExperience}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Domain Card */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Target className="w-5 h-5 text-purple-600" />
                                    </div>
                                    Your Domain
                                    {completedSteps.has("role") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2" ref={domainRef}>
                                    <Select
                                        value={formData.domain}
                                        onValueChange={(value) => handleInputChange("domain", value)}>
                                        <SelectTrigger className="w-full text-sm  border-2 border-gray-100 rounded-xl focus:border-purple-500 h-12">
                                            <SelectValue placeholder="Select Your Domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(domains as any[]).map((option) => (
                                                <SelectItem key={option.id} value={String(option.id)} className="text-base">
                                                    {option.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.role}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Competency Card */}
                        {/* <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Award className="w-5 h-5 text-orange-600" />
                                    </div>
                                    Competency
                                    {completedSteps.has("competencySubject") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Select
                                        value={formData.competencySubject[0] || ""}
                                        onValueChange={value => handleInputChange("competencySubject", [value])}
                                    >
                                        <SelectTrigger className="text-lg border-2 border-gray-100 rounded-xl focus:border-orange-500 h-12">
                                            <SelectValue placeholder="Select Competency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {competencies.map((option) => (
                                                <SelectItem key={option.id} value={option.id} className="text-base">
                                                    {option.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.competencySubject && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.competencySubject}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card> */}

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Award className="w-5 h-5 text-orange-600" />
                                    </div>
                                    Competency
                                    {completedSteps.has("competencySubject") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2" ref={competencyRef}>
                                    <MultiSelect
                                        options={competencies.map((c: any) => ({
                                            value: c.id,
                                            label: c.name,
                                        }))}
                                        onValueChange={(selected: string[]) => handleInputChange("competencySubject", selected)}
                                        defaultValue={formData.competencySubject}
                                        placeholder="Select Competencies"
                                        maxCount={5}
                                    />
                                    {errors.competencySubject && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.competencySubject}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Card */}
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="pb-0">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    Skills & Expertise
                                    {completedSteps.has("skills") && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                                </CardTitle>
                                <p className="text-sm text-gray-600">Add skills like Oracle, Java, SQL, etc. (Minimum of 1)</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4" ref={skillsRef}>
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                                        <p className="text-sm text-yellow-800 font-medium">
                                            💡 Please ensure to select all your skills to receive relevant job notifications.
                                        </p>
                                    </div>
                                    <SkillsInput skillsList={skillsList} onSkillsChange={handleSkillsChange} />
                                    {errors.skills && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            {errors.skills}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2  pt-6 items-start bg-white shadow-lg rounded-lg p-4 w-full border-t border-gray-200">
                        {/* Progress Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{Math.round(progressPercentage)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex justify-center mt-4 space-x-4">

                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white py-6 px-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Continue
                            </Button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}
