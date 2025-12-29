// components/DatePicker.tsx
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { arSA, enUS } from "date-fns/locale"

interface DatePickerProps {
  placeholder: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({ placeholder, value, onChange, minDate, maxDate }: DatePickerProps) {
  const { t } = useTranslation()
  const [internalDate, setInternalDate] = useState<Date | undefined>(value)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const locale = t('_rtl') === 'rtl' ? arSA : enUS

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
          className={t('_rtl') === 'rtl' ? "justify-start text-right" : "justify-start text-left"}
        >
          <CalendarIcon className={t('_rtl') === 'rtl' ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
          {date ? format(date, "PPP", { locale }) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) =>
            (minDate && date < minDate) || (maxDate && date > maxDate)
          }
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  )
}
