"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserDetailsTab } from "./user-details-tab"
import { ProfessionalDetailsTab } from "./professional-details-tab"
import { User, Briefcase } from "lucide-react"


interface ProfileUpdateProps {
    userId: string
    domains: any
    subjects: any
    qualifications: any
    specializations: any
    colleges: any
    progSkills: any
    companies: any
    languages: any
    userDetails: any
    professionalDetails: any
}

export function ProfileUpdate({
    userId,
    domains,
    subjects,
    qualifications,
    specializations,
    colleges,
    progSkills,
    companies,
    languages,
    userDetails,
    professionalDetails,
}: ProfileUpdateProps) {
    const [activeTab, setActiveTab] = useState("professional")

    const userName = professionalDetails?.firstName || "My Profile";
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">{userName}</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-md p-1 h-auto">
                        <TabsTrigger 
                            value="professional" 
                            className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white py-3 text-base font-semibold"
                        >
                            <Briefcase className="w-5 h-5" />
                            Professional Details
                        </TabsTrigger>
                        <TabsTrigger 
                            value="user" 
                            className="flex items-center gap-2 data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white py-3 text-base font-semibold"
                        >
                            <User className="w-5 h-5" />
                            User Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="professional" className="mt-0">
                        <ProfessionalDetailsTab
                            userId={userId}
                            domains={domains}
                            subjects={subjects}
                            qualifications={qualifications}
                            specializations={specializations}
                            colleges={colleges}
                            progSkills={progSkills}
                            companies={companies}
                            languages={languages}
                            professionalDetails={professionalDetails}
                            userDetails={userDetails}
                        />
                    </TabsContent>

                    <TabsContent value="user" className="mt-0">
                        {userDetails ? (
                            <UserDetailsTab userId={userId} userDetails={userDetails} />
                        ) : (
                            <div className="flex items-center justify-center py-12 text-lg text-gray-500">Loading user details...</div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

