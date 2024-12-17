import React from 'react';
import FilterableCell from './FilterableCell';

export const getNeedsReviewColumnDefinitions = (setGlobalFilter) => {
  if (!setGlobalFilter) {
    console.warn('setGlobalFilter function not provided to getNeedsReviewColumnDefinitions');
  }

  return [
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
      header: 'Man Name',
      accessorKey: 'manufacturerName',
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
