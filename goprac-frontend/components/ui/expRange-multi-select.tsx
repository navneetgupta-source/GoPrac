"use client"

import { CheckIcon, ChevronsUpDownIcon, XIcon, FileBadge } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from "react"

interface ExperienceOption {
  value: string
  label: string
  index: number
}

interface ExperienceMultiSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

const experienceOptions: ExperienceOption[] = [
  { value: "0-1", label: "0-1 Years", index: 0 },
  { value: "1-3", label: "1-3 Years", index: 1 },
  { value: "3+", label: "3+ Years", index: 2 },
]

// Check if selected indices are consecutive
function areConsecutive(selectedIndices: number[]): boolean {
  if (selectedIndices.length <= 1) return true
  
  const sorted = [...selectedIndices].sort((a, b) => a - b)
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      return false
    }
  }
  return true
}

// Generate experience value from selected indices
function generateExperienceValue(selectedIndices: number[]): string {
  if (selectedIndices.length === 0) return ''
  
  const sorted = [...selectedIndices].sort((a, b) => a - b)
  
  if (sorted.length === 1) {
    return experienceOptions[sorted[0]].value
  } else if (sorted.length === 2) {
    if (sorted[0] === 0 && sorted[1] === 1) return '0-3'
    if (sorted[0] === 1 && sorted[1] === 2) return '1-3+'
  } else if (sorted.length === 3) {
    return '0-3+'
  }
  
  return ''
}

// Parse experience value back to selected indices
function parseExperienceValue(value: string): number[] {
  if (!value) return []
  
  switch (value) {
    case '0-1': return [0]
    case '1-3': return [1]
    case '3+': return [2]
    case '0-3': return [0, 1]
    case '1-3+': return [1, 2]
    case '0-3+': return [0, 1, 2]
    default: return []
  }
}

// Get clean display text (like a regular select)
function getDisplayText(selectedIndices: number[]): string {
  if (selectedIndices.length === 0) return ''
  
  const sorted = [...selectedIndices].sort((a, b) => a - b)
  
  if (sorted.length === 1) {
    return experienceOptions[sorted[0]].label
  } else if (sorted.length === 2) {
    if (sorted[0] === 0 && sorted[1] === 1) return '0-3 Years'
    if (sorted[0] === 1 && sorted[1] === 2) return '1-3+ Years'
  } else if (sorted.length === 3) {
    return '0-3+ Years'
  }
  
  return sorted.map(i => experienceOptions[i].label).join(' + ')
}

export function ExperienceMultiSelect({
  value,
  onChange,
  placeholder = "Experience Range (Years)",
  className,
  required = false
}: ExperienceMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // Parse initial value
  useEffect(() => {
    setSelectedIndices(parseExperienceValue(value))
  }, [value])

  const handleToggleOption = (optionIndex: number) => {
    const newIndices = selectedIndices.includes(optionIndex)
      ? selectedIndices.filter(i => i !== optionIndex)
      : [...selectedIndices, optionIndex]

    // Check if the new selection is consecutive
    if (areConsecutive(newIndices)) {
      setSelectedIndices(newIndices)
      const newValue = generateExperienceValue(newIndices)
      onChange(newValue)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIndices([])
    onChange('')
  }

  const displayText = getDisplayText(selectedIndices)

  return (
    <div className="relative">
      <FileBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full pl-12 pr-10 py-3 rounded-xl border text-left border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none bg-white"
          >
            <span className={cn("text-gray-500")}>
            {displayText || placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <ChevronsUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {selectedIndices.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-1"
          >
            <XIcon size={14} className="text-gray-400" />
          </button>
        )}
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {experienceOptions.map((option) => {
                  const isSelected = selectedIndices.includes(option.index)
                  const wouldBeConsecutive = areConsecutive([...selectedIndices.filter(i => i !== option.index), ...(isSelected ? [] : [option.index])])
                  const isDisabled = !isSelected && !wouldBeConsecutive
                  
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleToggleOption(option.index)}
                      className={cn(
                        "cursor-pointer",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isDisabled}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                      {isDisabled}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {required && (
        <input
        type="text"
        value={value}
        onChange={() => {}}
        required={required}
        title="Please select experience range"
        style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1
        }}
        tabIndex={-1}
        aria-hidden="true"
        />

        )}

    </div>
  )
}
