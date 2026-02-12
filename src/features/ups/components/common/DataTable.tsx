import React from 'react';
import type { DataTableProps } from '../../types';

/**
 * Generic data table component
 * Will be implemented in later tasks
 */
export function DataTable<T>({ data, columns, sortable, filterable, exportable, pagination }: DataTableProps<T>) {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={String(column.key)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={String(column.key)}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : String(row[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}