// components/DatePicker.tsx
import React, { useState, useEffect } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"

interface DatePickerProps {
  placeholder: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({ placeholder, value, onChange, minDate, maxDate }: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | undefined>(value)
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const date = value ?? internalDate

  const handleSelect = (selected: Date | undefined) => {
    setInternalDate(selected)
    onChange?.(selected)
    setPopoverOpen(false) // Close the popover after selecting a date
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-right"
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: arSA }) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        dir="rtl"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) =>
            (minDate && date < minDate) || (maxDate && date > maxDate)
          }
          locale={arSA}
        />
      </PopoverContent>
    </Popover>
  )
}
