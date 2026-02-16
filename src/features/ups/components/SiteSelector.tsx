import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { cn } from "../../../components/ui/utils";
import { getDashboardSites } from "../api/upsApi";
import type { DashboardSiteDto } from "../api/upsApi";

interface SiteSelectorProps {
  selectedSiteId: number;
  onSiteChange: (siteId: number) => void;
  className?: string;
}

export function SiteSelector({ selectedSiteId, onSiteChange, className }: SiteSelectorProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState<DashboardSiteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const isArabic = i18n.language === 'ar';

  // Fetch all sites
  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      try {
        const dashboardSites = await getDashboardSites();
        setSites(dashboardSites);
      } catch (error) {
        console.error('Failed to fetch sites:', error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Get the selected site name
  const selectedSite = sites.find(site => site.siteId === selectedSiteId);
  const selectedSiteName = selectedSite
    ? (isArabic && selectedSite.siteArabicName ? selectedSite.siteArabicName : selectedSite.siteName)
    : t("ups.selectSite");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[300px] justify-between", className)}
          disabled={loading}
        >
          <span className="truncate">
            {loading ? t("common.loading") : selectedSiteName}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command className="max-h-[540px]">
          <CommandInput placeholder={t("ups.searchSite")} />
          <CommandList style={{ maxHeight: '285px', overflowY: 'auto' }}>
            <CommandEmpty>{t("ups.noSiteFound")}</CommandEmpty>
            <CommandGroup>
              {sites.map((site) => {
                const siteName = isArabic && site.siteArabicName ? site.siteArabicName : site.siteName;
                const directorateName = isArabic && site.directorateARName ? site.directorateARName : site.directorateName;
                
                return (
                  <CommandItem
                    key={site.siteId}
                    value={`${site.siteName} ${site.siteArabicName || ''} ${site.siteId}`}
                    onSelect={() => {
                      onSiteChange(site.siteId);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        selectedSiteId === site.siteId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{siteName}</span>
                      <span className="text-xs text-gray-500 truncate">{directorateName}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
