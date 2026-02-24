/**
 * Reusable Site Multi-Select Dropdown Component
 * Extracted from CreateAlarmReportDialog
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { ChevronDownIcon } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  arabicName?: string;
}

interface SiteMultiSelectDropdownProps {
  sites: Site[];
  sitesLoading?: boolean;
  selectedSiteIds: number[];
  onSiteToggle: (siteId: number) => void;
  placeholder?: string;
  maxHeight?: string;
  maxWidth?: string;
  allowMultipleSelect?: boolean;
}

export function SiteMultiSelectDropdown({
  sites,
  sitesLoading = false,
  selectedSiteIds,
  onSiteToggle,
  placeholder,
  maxHeight = 'max-h-48',
  maxWidth = 'w-[var(--radix-popover-trigger-width)]',
  allowMultipleSelect = true,
}: SiteMultiSelectDropdownProps) {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const openScrollTopRef = useRef<number | null>(null);

  // Detect scroll on parent modal and close popover if threshold exceeded
  useEffect(() => {
    const SCROLL_THRESHOLD = 60; // Pixels

    const handleModalScroll = () => {
      if (!isPopoverOpen) return;
      if (!modalScrollRef.current) return;

      if (openScrollTopRef.current === null) {
        openScrollTopRef.current = modalScrollRef.current.scrollTop;
      }

      const currentScrollTop = modalScrollRef.current.scrollTop;
  const scrolledDistance = Math.abs(currentScrollTop - openScrollTopRef.current);

      if (scrolledDistance >= SCROLL_THRESHOLD) {
        setIsPopoverOpen(false);
  openScrollTopRef.current = null;
      }
    };

const scrollElement = modalScrollRef.current;
    if (isPopoverOpen && scrollElement) {
      openScrollTopRef.current = scrollElement.scrollTop;
      scrollElement.addEventListener('scroll', handleModalScroll, { passive: true });

    return () => {
        scrollElement.removeEventListener('scroll', handleModalScroll);
      };
    } else if (!isPopoverOpen) {
      openScrollTopRef.current = null;
    }
  }, [isPopoverOpen, modalScrollRef]);

  const selectedSiteNames = selectedSiteIds.map(id => {
    const site = sites.find(s => s.id === id);
    return site ? (t('_rtl') === 'rtl' ? (site.arabicName || site.name) : (site.name || site.name)) : '';
  }).filter(name => name !== '');

  const handleSiteToggle = (siteId: number) => {
    if (!allowMultipleSelect && selectedSiteIds.includes(siteId)) {
      // For single select, allow deselection
      onSiteToggle(siteId);
    } else if (!allowMultipleSelect && selectedSiteIds.length > 0 && !selectedSiteIds.includes(siteId)) {
  // For single select, replace selection
      const currentSelected = selectedSiteIds[0];
      onSiteToggle(currentSelected);
      onSiteToggle(siteId);
    } else {
      // For multiple select
      onSiteToggle(siteId);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
<Button
     variant="outline"
 role="combobox"
 aria-expanded={isPopoverOpen}
          className="w-full justify-between"
        >
          <span className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
            {selectedSiteIds.length === 0
   ? (placeholder || t('sites.selectSite') || 'Select a site')
 : selectedSiteNames.join(', ')}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
   </PopoverTrigger>
      <PopoverContent 
        align="start" 
        onOpenAutoFocus={(e) => e.preventDefault()} 
        sideOffset={5} 
        collisionPadding={10} 
    className={`${maxWidth} p-0`}
      >
 <div className="p-2">
          <Input
   placeholder={t('sites.search') || 'Search sites...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
onKeyDown={(e) => e.stopPropagation()}
            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
          />
        </div>
        <ScrollArea ref={scrollAreaRef} className={`h-auto ${maxHeight} rounded-md bg-white`}>
       <div className="p-1">
  {sitesLoading ? (
       <div className="p-2 text-center text-sm text-gray-500">
           {t('common.loading') || 'Loading...'}
   </div>
  ) : sites.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500">
     {t('common.noData') || 'No sites available'}
      </div>
   ) : (
    sites
     .filter(site =>
       t('_rtl') === 'rtl'
        ? (site.arabicName || site.name).toLowerCase().includes(searchQuery.toLowerCase())
     : (site.name || site.name).toLowerCase().includes(searchQuery.toLowerCase())
        )
             .map((site) => (
           <div
         key={site.id}
           className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
       >
  <Checkbox
 id={`site-${site.id}`}
     checked={selectedSiteIds.includes(site.id)}
               onCheckedChange={() => handleSiteToggle(site.id)}
         />
        <Label htmlFor={`site-${site.id}`} className="ml-2 cursor-pointer">
    {t('_rtl') === 'rtl' ? (site.arabicName || site.name) : (site.name || site.name)}
        </Label>
        </div>
))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
