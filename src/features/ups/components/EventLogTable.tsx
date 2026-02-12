import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { AlarmEvent } from "../types";

interface EventLogTableProps {
  events: AlarmEvent[];
}

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-700",
  info: "bg-blue-100 text-blue-700",
};

export function EventLogTable({ events }: EventLogTableProps) {
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
          <TableHead>{t("ups.fields.site")}</TableHead>
          <TableHead>{t("ups.fields.field")}</TableHead>
          <TableHead>{t("ups.fields.severity")}</TableHead>
          <TableHead>{t("ups.fields.message")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500">
              {t("common.noData")}
            </TableCell>
          </TableRow>
        ) : (
          events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{formatDateTime(event.timestamp)}</TableCell>
              <TableCell>{event.siteName}</TableCell>
              <TableCell>{event.field}</TableCell>
              <TableCell>
                <Badge className={`${severityStyles[event.severity]} border-0`}>
                  {t(`ups.severity.${event.severity}`)}
                </Badge>
              </TableCell>
              <TableCell>{event.message}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
