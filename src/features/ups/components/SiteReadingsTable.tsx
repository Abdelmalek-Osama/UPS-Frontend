import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { ReadingRow } from "../types";

interface SiteReadingsTableProps {
  rows: ReadingRow[];
}

export function SiteReadingsTable({ rows }: SiteReadingsTableProps) {
  const { t } = useTranslation();

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString();
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
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
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500">
              {t("common.noData")}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
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
  );
}
