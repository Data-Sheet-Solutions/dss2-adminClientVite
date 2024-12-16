export const getColumnDefinitions = () => [
  {
    id: 'productIdentifier',
    header: 'Product Name',
    accessorKey: 'productIdentifier',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'manName',
    header: 'Manufacturer',
    accessorKey: 'manName',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'sdsDate',
    header: 'SDS Date',
    accessorKey: 'sdsDate',
    enableSorting: true,
    defaultVisible: true,
    cell: ({ getValue }) => {
      const date = getValue();
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
  },
  {
    id: 'aka',
    header: 'Alternative Names',
    accessorKey: 'aka',
    enableSorting: true,
    defaultVisible: false,
    cell: ({ getValue }) => {
      const aka = getValue();
      if (!aka || !Array.isArray(aka)) return '';
      return aka.join(', ');
    },
  },
];
