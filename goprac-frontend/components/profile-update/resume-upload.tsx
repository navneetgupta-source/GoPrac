"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, CheckCircle, X } from "lucide-react"
import { toast } from "sonner"

interface ResumeUploadProps {
    userId: string
    userName?: string // Add userName for filename
    currentResume?: string
    onUploadComplete: (url: string) => void
}

export function ResumeUpload({ userId, userName = "", currentResume, onUploadComplete }: ResumeUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<string | null>(currentResume || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type - matches viewmodel.js validation
        const allowedExtensions = /(.pdf|.docx)$/i
        if (!allowedExtensions.test(file.name)) {
            toast.error("Please select a PDF or DOCX file")
            return
        }

        // Validate file size (max 10MB) - matches viewmodel.js validation
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size exceeds 10MB limit")
            return
        }

        setIsUploading(true)

        try {
            // Create FormData and upload using uploadtoS3 API endpoint
            const formData = new FormData()
            formData.append("file", file)

            // Generate new filename based on user ID and first 3 letters of name (trim, fallback to 'User')
            const fileExtension = file.name.split('.').pop()
            let safeName = (userName || "User").replace(/[^a-zA-Z0-9]/g, "").trim()
            if (!safeName) safeName = "User"
            const namePart = safeName.substring(0, 3) || "Usr"
            const newFileName = `${userId}_${namePart}_Resume.${fileExtension}`
            formData.append("json", JSON.stringify({ newFileName: newFileName }))

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?uploadtoS3`, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (data.fileUrl) {
                setUploadedFile(data.fileUrl)
                onUploadComplete(data.fileUrl)
                toast.success("Resume uploaded successfully!")
            } else {
                throw new Error("Failed to get file URL from response")
            }
        } catch (error) {
            console.error("Error uploading resume:", error)
            toast.error("Failed to upload resume. Please try again.")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = () => {
        setUploadedFile(null)
        onUploadComplete("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const getFileName = (url: string) => {
        try {
            const urlObj = new URL(url)
            const pathname = urlObj.pathname
            return pathname.split('/').pop() || 'resume.pdf'
        } catch {
            return 'resume.pdf'
        }
    }

    // Shared style for both states
    const sectionStyle = {
        background: "linear-gradient(135deg, rgba(227,240,255,0.7) 0%, rgba(203,226,250,0.6) 100%)",
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
        minHeight: "120px",
        padding: "1.25rem 1.5rem",
        borderRadius: "1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #b6d0ea",
        boxShadow: "0 6px 32px 0 rgba(80,120,180,0.10)",
        width: "100%"
    };
    return (
        <div className="space-y-3 md:space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />

            <div style={sectionStyle}>
                {uploadedFile ? (
                    <>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#d0e6fa] to-[#e3f0ff] rounded-lg border border-[#b6d0ea] bg-opacity-70" style={{background: "linear-gradient(135deg, rgba(208,230,250,0.7) 0%, rgba(227,240,255,0.6) 100%)", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)"}}>
                                <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#3a5ca8]" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-semibold text-[#1a2a6c]">
                                    {getFileName(uploadedFile)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <a
                                href={uploadedFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#3a5ca8] underline text-xs md:text-sm font-medium hover:text-[#1a2a6c]"
                            >
                                View Resume
                            </a>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[#3a5ca8] hover:text-[#1a2a6c] hover:bg-[#e3f0ff] px-2 py-1 text-xs md:text-sm cursor-pointer border border-[#b6d0ea] rounded shadow"
                            >
                                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="ml-1">Re-Upload</span>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemove}
                                className="text-[#1a2a6c] hover:text-[#3a5ca8] hover:bg-[#e3f0ff] px-2 py-1 text-xs md:text-sm cursor-pointer border border-[#b6d0ea] rounded shadow"
                            >
                                <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-3 bg-gradient-to-br from-[#d0e6fa] to-[#e3f0ff] rounded-lg border border-[#b6d0ea] bg-opacity-70" style={{background: "linear-gradient(135deg, rgba(208,230,250,0.7) 0%, rgba(227,240,255,0.6) 100%)", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)"}}>
                                <Upload className="w-5 h-5 md:w-6 md:h-6 text-[#3a5ca8]" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-semibold text-[#1a2a6c]">
                                    Click to upload your resume
                                </p>
                                <p className="text-xs md:text-sm text-[#5c7fa3] mt-1">
                                    PDF or DOC (Max 10MB)
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[#3a5ca8] hover:text-[#1a2a6c] hover:bg-[#e3f0ff] px-2 py-1 text-xs md:text-sm cursor-pointer border border-[#b6d0ea] rounded shadow"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="ml-1">Upload</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
