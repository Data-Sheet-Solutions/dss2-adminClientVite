import { Badge } from 'react-bootstrap';

export const getManufacturerColumnDefinitions = () => [
  {
    id: 'manName',
    header: 'Manufacturer',
    accessorKey: 'manName',
    enableSorting: true,
    enableFiltering: true,
    defaultVisible: true,
  },
  {
    id: 'trusted',
    header: 'Trusted',
    accessorKey: 'trusted',
    enableSorting: true,
    defaultVisible: true,
    cell: ({ getValue }) => {
      const trusted = getValue();
      return trusted ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>;
    },
  },
  {
    id: 'variantCount',
    header: 'Variants',
    accessorKey: 'variantCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'datasheetCount',
    header: 'Datasheets',
    accessorKey: 'datasheetCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'updatedAt',
    header: 'Last Updated',
    accessorKey: 'updatedAt',
    enableSorting: true,
    defaultVisible: true,
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? new Date(date).toLocaleDateString() : '';
    },
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    enableSorting: true,
    defaultVisible: false,
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? new Date(date).toLocaleDateString() : '';
    },
  },
];
