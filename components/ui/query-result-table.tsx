import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@/components/ui/icons";
import { format } from "date-fns";

// Define a type for possible cell values
type CellValue = string | number | Date | bigint | boolean | null | undefined;

// Define a type for the row data
type RowData = Record<string, CellValue>;

interface QueryResultTableProps {
  data: RowData[];
}

export function QueryResultTable({ data }: QueryResultTableProps) {
  if (!data || data.length === 0) {
    return <p>The query returned no results.</p>;
  }

  const headers = Object.keys(data[0]);
  const previewData = data.slice(0, 10); // Limit to 10 rows

  const formatValue = (value: CellValue): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === "string") {
      return value.replace(/^"|"$/g, "");
    }
    if (typeof value === "number") {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    if (value instanceof Date) {
      return format(value, "yyyy-MM-dd");
    }
    if (typeof value === "bigint") {
      return value.toString();
    }
    return String(value);
  };

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = formatValue(row[header]);
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  return (
    <div className="space-y-2">
      <div className="flex justify-end items-center">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
            download="query_result.csv"
          >
            <IconDownload className="mr-2 h-4 w-4" />
            Download CSV
          </a>
        </Button>
      </div>
      <Table>
        <TableCaption>
          Preview of query results (showing up to 10 rows)
        </TableCaption>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {formatValue(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
