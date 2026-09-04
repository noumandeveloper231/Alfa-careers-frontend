import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

const DataTable = ({
  columns,
  data,
  rowKey = '_id',
  loading = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data found.',
  emptyIcon: EmptyIcon = null,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  startItem,
  endItem,
  totalItems,
  selectedRows = [],
  wrapperClassName = 'overflow-x-auto rounded-lg border border-gray-200',
  theadClassName = 'bg-white text-gray-500 text-xs font-semibold uppercase tracking-wide',
  rowClassName = '',
  renderRow = null,
}) => {
  if (loading) {
    return (
      <div className={wrapperClassName}>
        <table className="min-w-full bg-white border-collapse">
          {columns.length > 0 && (
            <thead className={theadClassName}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-6 py-4 text-left ${col.headerClassName || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            <tr>
              <td colSpan={columns.length || 1} className="py-12 text-center text-gray-500">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p>{loadingMessage}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={wrapperClassName}>
        <table className="min-w-full bg-white border-collapse">
          {columns.length > 0 && (
            <thead className={theadClassName}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={`px-6 py-4 text-left ${col.headerClassName || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            <tr>
              <td colSpan={columns.length || 1} className="py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  {EmptyIcon && <div className="text-gray-400"><EmptyIcon /></div>}
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className={wrapperClassName}>
        <table className="min-w-full bg-white border-collapse">
          <thead className={theadClassName}>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 text-left ${col.headerClassName || ''}`}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <React.Fragment key={item[rowKey] || rowIndex}>
                {renderRow ? (
                  renderRow(item, rowIndex)
                ) : (
                  <tr className={`border-t border-gray-200 hover:bg-gray-50 ${rowClassName}`}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                        {col.render ? col.render(item, rowIndex) : (col.key ? item[col.key] : '-')}
                      </td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && onPageChange && data?.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 gap-4">
          {selectedRows?.length > 0 && (
            <div className="text-sm text-gray-500">
              {selectedRows.length} of {data.length} row(s) selected
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
            {onPageSizeChange && (
              <div className="items-center gap-2 text-sm hidden sm:flex">
                <span className="text-gray-500">Rows per page:</span>
                <CustomSelect
                  value={pageSize}
                  onChange={(e) => {
                    onPageSizeChange(Number(e.target.value));
                    onPageChange(1);
                  }}
                  className="!px-2 !py-1 text-sm w-[80px]!"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </CustomSelect>
              </div>
            )}

            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 hidden md:flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="First page"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-3" />
              </button>

              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startP = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endP = Math.min(totalPages, startP + maxVisible - 1);
                  if (endP - startP + 1 < maxVisible) startP = Math.max(1, endP - maxVisible + 1);

                  if (startP > 1) {
                    pages.push(
                      <button key={1} onClick={() => onPageChange(1)}
                        className={`h-8 w-8 flex items-center justify-center border rounded-md text-sm ${currentPage === 1 ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-gray-300 hover:bg-gray-50'}`}
                      >1</button>
                    );
                    if (startP > 2) pages.push(
                      <span key="ellipsis-start" className="px-2 text-sm text-gray-400 hidden sm:inline">...</span>
                    );
                  }
                  for (let i = startP; i <= endP; i++) {
                    pages.push(
                      <button key={i} onClick={() => onPageChange(i)}
                        className={`h-8 w-8 flex items-center justify-center border rounded-md text-sm ${currentPage === i ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-gray-300 hover:bg-gray-50'}`}
                      >{i}</button>
                    );
                  }
                  if (endP < totalPages) {
                    if (endP < totalPages - 1) pages.push(
                      <span key="ellipsis-end" className="px-2 text-sm text-gray-400 hidden sm:inline">...</span>
                    );
                    pages.push(
                      <button key={totalPages} onClick={() => onPageChange(totalPages)}
                        className={`h-8 w-8 flex items-center justify-center border rounded-md text-sm ${currentPage === totalPages ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-gray-300 hover:bg-gray-50'}`}
                      >{totalPages}</button>
                    );
                  }
                  return pages;
                })()}
              </div>

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 hidden md:flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Last page"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;
