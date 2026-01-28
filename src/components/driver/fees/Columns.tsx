'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VendorFee } from '@/lib/vendor-fees';

const StatusBadge = ({ status }: { status: VendorFee['status'] }) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    case 'unpaid':
    default:
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Unpaid
        </Badge>
      );
  }
};


export const columns: ColumnDef<VendorFee>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: 'feeAmount',
    header: () => <div className="text-right">Fee Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('feeAmount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
