import React from 'react';
import FilterableCell from './FilterableCell';
import Actions from './Actions';

export const getNeedsReviewColumnDefinitions = (setGlobalFilter) => {
  if (!setGlobalFilter) {
    console.warn('setGlobalFilter function not provided to getNeedsReviewColumnDefinitions');
  }

  return [
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <Actions row={row.original} />,
      enableSorting: false,
      enableFiltering: false,
      defaultVisible: true,
    },
    {
      id: 'productIdentifier',
      header: 'Product',
      accessorKey: 'productIdentifier',
      enableSorting: true,
      enableFiltering: true,
      defaultVisible: true,
    },
    {
      id: 'manufacturerName',
      header: 'Manufacturer',
      accessorKey: 'manName',
      enableSorting: true,
      enableFiltering: true,
      defaultVisible: true,
      cell: ({ getValue }) => <FilterableCell value={getValue()} onFilter={setGlobalFilter} />,
    },
    {
      id: 'lastVerifiedDate',
      header: 'Last Verified',
      accessorKey: 'lastVerifiedDate',
      enableSorting: true,
      defaultVisible: true,
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
    {
      id: 'numClients',
      header: 'Count',
      accessorKey: 'autoPilotClientCount',
      enableSorting: true,
      enableFiltering: true,
      defaultVisible: true,
    },
  ];
};
