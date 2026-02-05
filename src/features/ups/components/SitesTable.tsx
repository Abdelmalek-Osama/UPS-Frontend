import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { SiteSummary } from "../types";

interface SitesTableProps {
  sites: SiteSummary[];
}

export function SitesTable({ sites }: SitesTableProps) {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ups.fields.site")}</TableHead>
          <TableHead>{t("ups.fields.upstream")}</TableHead>
          <TableHead>{t("ups.fields.downstream")}</TableHead>
          <TableHead>{t("ups.fields.batteryVoltage")}</TableHead>
          <TableHead>{t("ups.fields.flowRate")}</TableHead>
          <TableHead>{t("common.status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-500">
              {t("common.noData")}
            </TableCell>
          </TableRow>
        ) : (
          sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell className="font-medium">{site.name}</TableCell>
              <TableCell>{site.upstream.toFixed(2)}</TableCell>
              <TableCell>{site.downstream.toFixed(2)}</TableCell>
              <TableCell>{site.batteryVoltage.toFixed(2)}</TableCell>
              <TableCell>{site.flowRate.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={site.status === "active" ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                  {site.status === "active" ? t("common.active") : t("common.inactive")}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
