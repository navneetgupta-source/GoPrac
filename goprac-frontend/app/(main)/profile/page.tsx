" use c"

"use client";
import { useEffect, useState } from "react";
import { ProfileUpdate } from "@/components/profile-update/profile-update";

export default function ProfileUpdatePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [allLists, setAllLists] = useState({
        favourite_domain: [],
        favourite_subject: [],
        qualification: [],
        stream: [],
        college: [],
        fav_prog_skill: [],
        aspiration_company: [],
        languages: []
    });
    const [userDetails, setUserDetails] = useState<any>(null);
    const [professionalDetails, setProfessionalDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get userId from cookie
        let candidateId: string | null = null;
        if (typeof document !== "undefined") {
            const match = document.cookie.match(/pracUser=([^;]+)/);
            candidateId = match ? match[1] : null;
        }
        setUserId(candidateId);
        if (!candidateId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getAllList`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId }),
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getUserInfo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId }),
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getProfessionalInfo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ candidateId }),
            })
        ]).then(async ([listsRes, userRes, profRes]) => {
            if (listsRes.ok) {
                setAllLists(await listsRes.json());
            }
            if (userRes.ok) {
                const userData = await userRes.json();
                // If userData is an array, use the first element
                setUserDetails(Array.isArray(userData) ? userData[0] : userData.userInfo || userData || null);
            }
            if (profRes.ok) {
                const profData = await profRes.json();
                setProfessionalDetails(profData.professionaldetails || null);
            }
        }).catch((error) => {
            console.error("Error fetching profile data:", error);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-12"><span>Loading profile...</span></div>;
    }
    if (userId === null) {
        return <div>Please log in to view your profile</div>;
    }

    return (
        <ProfileUpdate
            userId={userId}
            domains={allLists.favourite_domain || []}
            subjects={allLists.favourite_subject || []}
            qualifications={allLists.qualification || []}
            specializations={allLists.stream || []}
            colleges={allLists.college || []}
            progSkills={allLists.fav_prog_skill || []}
            companies={allLists.aspiration_company || []}
            languages={allLists.languages || []}
            userDetails={userDetails}
            professionalDetails={professionalDetails}
        />
    );
}
