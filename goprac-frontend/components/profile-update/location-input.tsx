"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Loader2 } from "lucide-react"

interface LocationInputProps {
    value: string | { id: number, cityName: string }
    onChange: (value: string | { id: number, cityName: string }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
    // Accept value as either id, cityName, or object
    const [inputValue, setInputValue] = useState(() => {
        if (typeof value === 'object' && value !== null && value.cityName) {
            return value.cityName;
        }
        if (typeof value === 'string' && value && value.length > 0) {
            return value; // fallback, will be replaced by cityName if suggestions load
        }
        return value || '';
    });

    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Update inputValue when value prop changes
    useEffect(() => {
        if (typeof value === 'object' && value !== null && value.cityName) {
            setInputValue(value.cityName);
        } else if (typeof value === 'string') {
            setInputValue(value);
        } else if (!value) {
            setInputValue('');
        }
    }, [value]);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([])
            setShowSuggestions(false)
            setErrorMsg(query.length > 0 ? "Type at least 3 characters" : "")
            return
        }

        setIsLoading(true)
        setErrorMsg("")

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getSuggestedLocationList`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: query }),
            })

            const data = await response.json()

            if (data.status === 0 || !data || data.length === 0) {
                setSuggestions([])
                setErrorMsg("No Location Found. Please correct it!")
                setShowSuggestions(false)
            } else {
                setSuggestions(data)
                setShowSuggestions(true)
                setErrorMsg("")
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error)
            setSuggestions([])
            setErrorMsg("Error fetching locations")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setInputValue(query)
        // Pass only cityName string to parent if user is typing
        onChange(query)

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Debounce the API call
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(query)
        }, 300)
    }

    const handleSelectLocation = (location: any) => {
        setInputValue(location.cityName)
        // Pass the full location object (id, cityName) to parent
        onChange(location)
        setShowSuggestions(false)
        setErrorMsg("")
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type to search locations (min 3 chars)..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setShowSuggestions(true)
                        }
                    }}
                    className="h-11 pl-10 pr-10 border-2 focus:border-purple-500"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
            </div>

            {errorMsg && (
                <p className="text-sm text-amber-600 mt-1">{errorMsg}</p>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-100 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                >
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <Search className="w-3 h-3" />
                            Suggested Locations
                        </p>
                    </div>
                    {suggestions.map((location) => (
                        <div
                            key={location.id}
                            className="px-4 py-3 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer text-sm font-medium text-gray-800 border-b border-gray-50 last:border-b-0 transition-all"
                            onClick={() => handleSelectLocation(location)}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                {location.cityName}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
