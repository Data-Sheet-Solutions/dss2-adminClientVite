import React, { useState, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Table } from 'react-bootstrap';
import { getColumnDefinitions } from './columnDefinitions';
import TableConfig from './TableConfig';
import PaginationComponent from './Pagination';
import { useGet } from '../../hooks/useGet';
import Cookies from 'js-cookie';

const ActiveRecordsTable = () => {
  // State management
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [search, setSearch] = useState('');

  // API hook
  const { getData, isLoading, error } = useGet();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: pageIndex + 1,
          limit: pageSize,
          search: search,
          ...(sorting.length > 0 && {
            sortBy: sorting[0].id,
            sortOrder: sorting[0].desc ? 'desc' : 'asc',
          }),
        });

        const response = await getData('/fulfill/activeRecords?' + queryParams.toString());
        setData(response.datasheets);
        setTotalItems(response.pagination.totalItems);
      } catch (err) {
        console.error('Error fetching active records:', err);
      }
    };

    fetchData();
  }, [pageIndex, pageSize, sorting, search]);

  // Column definitions
  const columns = useMemo(() => getColumnDefinitions(), []);

  // Initialize column visibility from cookies
  useEffect(() => {
    const savedVisibility = Cookies.get('activeRecords_columnVisibility');
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility));
      } catch (error) {
        console.error('Error parsing column visibility cookie:', error);
        const defaultVisibility = {};
        columns.forEach((col) => {
          defaultVisibility[col.id] = col.defaultVisible ?? false;
        });
        setColumnVisibility(defaultVisibility);
      }
    } else {
      const defaultVisibility = {};
      columns.forEach((col) => {
        defaultVisibility[col.id] = col.defaultVisible ?? false;
      });
      setColumnVisibility(defaultVisibility);
    }
  }, [columns]);

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(totalItems / pageSize),
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      Cookies.set('activeRecords_columnVisibility', JSON.stringify(newVisibility), { expires: 365 });
    },
  });

  if (error) {
    return <div className="alert alert-danger">Error loading active records: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      <TableConfig
        table={table}
        globalFilter={search}
        setGlobalFilter={setSearch}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        title="Active Records"
        totalCount={totalItems}
      />

      <div className="flex-grow-1 overflow-auto">
        <Table striped bordered hover>
          <thead className="sticky-top bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="d-flex align-items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="ms-2">
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted()] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={table.getAllColumns().length} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="mt-auto">
        <PaginationComponent
          currentPage={pageIndex + 1}
          totalPages={Math.ceil(totalItems / pageSize)}
          pageSize={pageSize}
          totalEntries={totalItems}
          onPageChange={(newPage) => setPageIndex(newPage)}
          previousPage={() => setPageIndex((prev) => Math.max(0, prev - 1))}
          nextPage={() => setPageIndex((prev) => prev + 1)}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};

export default ActiveRecordsTable;
