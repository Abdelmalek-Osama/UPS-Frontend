// components/DatePicker.tsx
import { useState } from "react"
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
}

export function DatePicker({ placeholder, value, onChange }: DatePickerProps) {
  const [internalDate, setInternalDate] = useState<Date | undefined>(value)
  const date = value ?? internalDate

  const handleSelect = (selected: Date | undefined) => {
    setInternalDate(selected)
    onChange?.(selected)
  }

  return (
    <Popover>
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
          disabled={(date) => date > new Date()}
          locale={arSA}
        />
      </PopoverContent>
    </Popover>
  )
}
