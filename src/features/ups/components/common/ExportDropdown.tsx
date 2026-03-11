import { Download } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export interface ExportDropdownProps {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPNG?: () => void;
  onExportSVG?: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
}

export function ExportDropdown({
  onExportCSV,
  onExportExcel,
  onExportPNG,
  onExportSVG,
  onExportPDF,
  disabled = false,
  size = "sm",
}: ExportDropdownProps) {
  const { t } = useTranslation();

  const hasTableExport = onExportCSV || onExportExcel || onExportPDF;
  const hasChartExport = onExportPNG || onExportSVG;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={disabled}>
          <Download className="w-4 h-4 mr-2" />
          {t("common.export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasTableExport && (
          <>
            {onExportCSV && (
              <DropdownMenuItem onClick={onExportCSV}>
                {t("common.exportCSV")}
              </DropdownMenuItem>
            )}
            {onExportExcel && (
              <DropdownMenuItem onClick={onExportExcel}>
                {t("common.exportExcel")}
              </DropdownMenuItem>
            )}
            {onExportPDF && (
              <DropdownMenuItem onClick={onExportPDF}>
                {t("common.exportPDF") || "Export as PDF"}
              </DropdownMenuItem>
            )}
          </>
        )}
        {hasChartExport && (
          <>
            {onExportPNG && (
              <DropdownMenuItem onClick={onExportPNG}>
                {t("common.exportPNG")}
              </DropdownMenuItem>
            )}
            {onExportSVG && (
              <DropdownMenuItem onClick={onExportSVG}>
                {t("common.exportSVG")}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
