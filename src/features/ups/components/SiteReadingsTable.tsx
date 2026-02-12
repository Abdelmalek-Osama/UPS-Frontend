import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReadingRow } from "../types";

interface SiteReadingsTableProps {
  rows: ReadingRow[];
}

export function SiteReadingsTable({ rows }: SiteReadingsTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Calculate pagination
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = rows.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">{t("common.date")}</TableHead>
            <TableHead className="text-center">{t("common.hour")}</TableHead>
            <TableHead className="text-center">{t("ups.fields.upstream")}</TableHead>
            <TableHead className="text-center">{t("ups.fields.downstream")}</TableHead>
            <TableHead className="text-center">{t("ups.fields.flowRate")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                {t("common.noData")}
              </TableCell>
            </TableRow>
          ) : (
            currentRows.map((row) => (
              <TableRow key={row.timestamp}>
                <TableCell className="text-center">{formatDate(row.timestamp)}</TableCell>
                <TableCell className="text-center">{formatTime(row.timestamp)}</TableCell>
                <TableCell className="text-center">{row.upstream.toFixed(2)}</TableCell>
                <TableCell className="text-center">{row.downstream.toFixed(2)}</TableCell>
                <TableCell className="text-center">{row.flowRate.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {rows.length > rowsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t("common.showing")} {startIndex + 1} {t("common.to")} {Math.min(endIndex, rows.length)} {t("common.of")} {rows.length} {t("common.entries")}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <div className="text-sm text-gray-600">
              {t("common.page")} {currentPage} {t("common.of")} {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
