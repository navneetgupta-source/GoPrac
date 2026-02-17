"use client"

import { useState, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface UserDetailsTabProps {
    userId: string
    userDetails: any
}

export function UserDetailsTab({ userId, userDetails }: UserDetailsTabProps) {
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
    useEffect(() => {
        console.log('UserDetailsTab userDetails:', userDetails);
    }, [userDetails]);
    const [formData, setFormData] = useState(() => ({
        smsOtp: userDetails?.smsOtp || "",
        emailId: "",
        password: "",
        confirmPassword: ""
    }));
    const [emailEdited, setEmailEdited] = useState(false);

    // When userDetails changes, reset form fields except email if user has edited it
    useEffect(() => {
        setFormData(prev => ({
            smsOtp: userDetails?.smsOtp || "",
            emailId: emailEdited ? prev.emailId : (userDetails?.emailId || ""),
            password: "",
            confirmPassword: ""
        }));
    }, [userDetails]);
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    // Removed useEffect and fetchUserInfo. All data comes from props.

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (field === "emailId") {
            setEmailEdited(true);
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const emailPattern = /^(\s+)?([A-Za-z0-9_\-\.])+[']?([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})(\s+)?$/;

        // Legacy: require email
        if (!formData.emailId || !emailPattern.test(formData.emailId)) {
            newErrors.emailId = "Please enter the above fields";
        }

        // Legacy: if either password or confirmPassword is filled, both must be filled and match
        const passwordFilled = formData.password.trim() !== "";
        const confirmPasswordFilled = formData.confirmPassword.trim() !== "";
        if ((passwordFilled || confirmPasswordFilled)) {
            if (!passwordFilled || !confirmPasswordFilled) {
                newErrors.confirmPassword = "Please enter the above fields";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Confirm password must be same as password";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) return

        setIsLoading(true)

        try {
            const payload: any = {
                smsOtp: formData.smsOtp,
                emailId: formData.emailId.trim(),
                userData: decodeURIComponent(userData ?? ""),
                password: formData.password.trim() // Always include password key, even if empty string
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?updateUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            // Normalize status to string for comparison
            const status = typeof data.status === "string" ? data.status : String(data.status);
            if (status === "1") {
                toast.success(data.response || "Profile Updated Successful.");
                setFormData(prev => ({
                    ...prev,
                    password: "",
                    confirmPassword: "",
                    smsOtp: userDetails?.smsOtp
                }))
            } else if (status === "0" || status === "-1") {
                toast.error(data.errorCode || "User Creation failed.");
            } else if (status === "-99") {
                toast.error("field not valid");
            } else if (status === "-70") {
                toast.error("user Id does not exist.");
            } else {
                toast.error("An unknown error occurred.");
            }
        } catch (error) {
            console.error("Error updating user info:", error)
            toast.error("An error occurred while updating user details")
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <Card className="border-0 shadow-lg bg-white mt-0">
            <CardHeader className="bg-gradient-to-r from-white via-blue-50 to-white border-b px-4 py-2 md:px-6 md:py-3 mt-0">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">User Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-2 pb-6 md:px-6 md:pt-3 md:pb-8 mt-0">
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" autoComplete="off">
                    {/* Hidden OTP Field (for parity with legacy) */}
                    <input
                        type="hidden"
                        name="smsOtp"
                        value={formData.smsOtp}
                        readOnly
                    />
                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="emailId" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Email ID
                        </Label>
                        <Input
                            id="emailId"
                            name="user_email"
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="off"
                            value={userDetails?.emailId || ""}
                            disabled
                            className="h-10 md:h-12 text-sm md:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                        {errors.emailId && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {errors.emailId}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                            <Lock className="w-5 h-5 text-blue-600" />
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="user_password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="h-10 md:h-12 text-sm md:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg pr-10"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5 cursor-pointer" /> : <Eye className="w-5 h-5 cursor-pointer" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                            <Lock className="w-5 h-5 text-blue-600" />
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="user_confirm_password"
                                type="password"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                className="h-10 md:h-12 text-sm md:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg pr-10"
                            />
                            {/* Tick or cross icon for match status */}
                            {formData.confirmPassword && formData.password ? (
                                formData.confirmPassword === formData.password ? (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                                ) : (
                                    <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5 cursor-pointer" />
                                )
                            ) : null}
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-center">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 h-9 md:h-10 text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg rounded-lg cursor-pointer w-fit min-w-[100px] transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
