import React from 'react';

const BrutalistTable = ({ columns = [], data = [], onRowClick, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="nexus-glass rounded-2xl p-10 text-center">
        <span className="material-symbols-outlined text-4xl text-text-muted/40 mb-3 block">table_chart</span>
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl nexus-glass">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-light">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-5 py-4 font-headline text-xs font-semibold uppercase tracking-wider text-text-muted ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/50">
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`transition-colors duration-200 hover:bg-primary/5 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-5 py-4 text-sm font-body text-text-primary ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrutalistTable;
