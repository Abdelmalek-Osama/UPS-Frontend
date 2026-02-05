import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { ReadingRow } from "../types";

interface SiteReadingsTableProps {
  rows: ReadingRow[];
}

export function SiteReadingsTable({ rows }: SiteReadingsTableProps) {
  const { t } = useTranslation();

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("common.dateTime")}</TableHead>
          <TableHead>{t("ups.fields.upstream")}</TableHead>
          <TableHead>{t("ups.fields.downstream")}</TableHead>
          <TableHead>{t("ups.fields.batteryVoltage")}</TableHead>
          <TableHead>{t("ups.fields.flowRate")}</TableHead>
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
              <TableCell>{formatDateTime(row.timestamp)}</TableCell>
              <TableCell>{row.upstream.toFixed(2)}</TableCell>
              <TableCell>{row.downstream.toFixed(2)}</TableCell>
              <TableCell>{row.batteryVoltage.toFixed(2)}</TableCell>
              <TableCell>{row.flowRate.toFixed(2)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
