import { Badge } from 'react-bootstrap';

export const getClientColumnDefinitions = () => [
  {
    id: 'clientName',
    header: 'Client Name',
    accessorKey: 'clientName',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'clientDomain',
    header: 'Domain',
    accessorKey: 'clientDomain',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'subscriptions',
    header: 'Subscriptions',
    accessorFn: (row) => row.billingInfo?.activeSubscription,
    enableSorting: false,
    defaultVisible: true,
    cell: ({ getValue }) => {
      const subscription = getValue();
      if (!subscription) return null;

      return (
        <div className="d-flex gap-1">
          {subscription.toolbox?.enabled && <Badge bg="secondary">tb</Badge>}
          {subscription.autoPilot?.enabled && <Badge bg="primary">ap</Badge>}
          {subscription.translations?.enabled && <Badge bg="success">tr</Badge>}
        </div>
      );
    },
  },
  {
    id: 'locationCount',
    header: 'Locations',
    accessorKey: 'locationCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'userCount',
    header: 'Users',
    accessorKey: 'userCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'activeCount',
    header: 'Active Records',
    accessorKey: 'activeCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'inProcessCount',
    header: 'In Process',
    accessorKey: 'inProcessCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'pendingCount',
    header: 'Pending',
    accessorKey: 'pendingCount',
    enableSorting: true,
    defaultVisible: true,
  },
  {
    id: 'legacyID',
    header: 'Legacy ID',
    accessorKey: 'legacyID',
    enableSorting: true,
    defaultVisible: false,
  },
  {
    id: 'crmID',
    header: 'CRM ID',
    accessorKey: 'crmID',
    enableSorting: true,
    defaultVisible: false,
  },
];
