"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import debounce from "lodash.debounce"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Sparkles } from "lucide-react"
import { QueryResult } from "mysql2"

interface Skill {
  id: string | number
  name: string
}

interface SkillsInputProps {
  skillsList: any[] 
  onSkillsChange: (skills: any[]) => void
  initialSkills?: any[]
}

export function SkillsInput({ skillsList, onSkillsChange, initialSkills = [] }: SkillsInputProps) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(initialSkills)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<Skill[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const negativeIdCounter = useRef(-1)

  const MAX_SKILLS = 20

  useEffect(() => {
    if (initialSkills.length > 0) {
      setSelectedSkills(initialSkills)
    }
  }, [initialSkills])





  // Debounced fetch for skill suggestions from API
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getSkillValues`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        setSuggestions((data.data || []).filter((s: Skill) => !selectedSkills.some((sel) => sel.id === s.id)))
        setShowSuggestions(true)
      } catch (err) {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300),
    [selectedSkills]
  )

  useEffect(() => {
    fetchSuggestions(inputValue)
    return () => { fetchSuggestions.cancel() }
  }, [inputValue, fetchSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setError("")
    if (selectedSkills.length >= MAX_SKILLS) {
      setError(`You can only select up to ${MAX_SKILLS} skills.`)
      return
    }
  }

  const addSkill = (skill: Skill) => {
    if (selectedSkills.some((s) => s.id === skill.id)) return

    const newSkills = [...selectedSkills, skill]
    setSelectedSkills(newSkills)
    onSkillsChange(newSkills)
    setInputValue("")
    setShowSuggestions(false)
    setError("")
  }

  const addSkillFromInput = () => {
    const query = inputValue.trim()
    if (!query) return
    const match = suggestions.find((s) => s.name.toLowerCase() === query.toLowerCase())
    if (match) {
      addSkill(match)
    } else {
      const customSkill = { id: negativeIdCounter.current--, name: query }
      addSkill(customSkill)
      setError(`The skill "${query}" is not present in the available options.`)
    }
    setInputValue("")
    setSuggestions([])
  }

  const removeSkill = (skillId: string | number) => {
    const newSkills = selectedSkills.filter((skill) => skill.id !== skillId)
    setSelectedSkills(newSkills)
    onSkillsChange(newSkills)
    setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkillFromInput()
    }
  }

  useEffect(() => {
    const handleKeyDownDoc = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        addSkillFromInput()
        e.preventDefault()
      }
    }
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        addSkillFromInput()
      }
    }
    document.addEventListener("keydown", handleKeyDownDoc)
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("keydown", handleKeyDownDoc)
      document.removeEventListener("click", handleClick)
    }
  })

  return (
    <div className="space-y-4">
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Selected Skills ({selectedSkills.length}/{MAX_SKILLS})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 ${
                  Number(skill.id) < 0
                    ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200"
                    : "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200"
                }`}
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="hover:bg-white/50 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type to search skills or add custom ones..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="text-base border-2 border-gray-100 rounded-xl focus-visible:border-indigo-500 pl-10 h-12"
          />
          <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto"
          >
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested Skills</p>
            </div>
            {suggestions.map((skill) => (
              <div
                key={skill.id}
                className="px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 cursor-pointer text-sm font-medium text-gray-800 border-b border-gray-50 last:border-b-0 transition-all duration-150"
                onClick={() => addSkill(skill)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  {skill.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error/Info Message */}
      {error && (
        <div
          className={`text-sm p-3 rounded-xl border ${
            error.includes("custom skill")
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
            {error}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {selectedSkills.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Skills added: {selectedSkills.length}</span>
          <span>{MAX_SKILLS - selectedSkills.length} remaining</span>
        </div>
      )}
    </div>
  )
}
