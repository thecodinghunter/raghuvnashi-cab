'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, CheckCircle, XCircle, Clock, FileDigit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Driver } from '@/lib/types';
import { ViewKycModal } from './ViewKycModal';

const DriverStatusBadge = ({ status }: { status: Driver['status'] }) => {
  switch (status) {
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case 'blocked':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Blocked
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

const FeeStatusBadge = ({ status }: { status: Driver['feeStatus'] }) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
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

type ColumnsProps = {
  onUpdateStatus: (driverId: string, status: 'approved' | 'blocked') => void;
  onMarkFeeAsPaid: (driver: Driver) => void;
};

export const columns = ({ onUpdateStatus, onMarkFeeAsPaid }: ColumnsProps): ColumnDef<Driver>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
        <div className="pl-2 flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
    )
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Driver Status',
    cell: ({ row }) => <DriverStatusBadge status={row.original.status} />,
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'feeStatus',
    header: 'Fee Status',
    cell: ({ row }) => <FeeStatusBadge status={row.original.feeStatus} />,
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
        const driver = row.original;
        const [isKycModalOpen, setIsKycModalOpen] = useState(false);
        return (
            <>
                <ViewKycModal 
                    isOpen={isKycModalOpen} 
                    onClose={() => setIsKycModalOpen(false)}
                    driver={driver}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onMarkFeeAsPaid(driver)} disabled={driver.feeStatus === 'paid'}>
                            Mark Fee as Paid
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setIsKycModalOpen(true)}>
                            <FileDigit className="mr-2 h-4 w-4" /> View KYC Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {driver.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => onUpdateStatus(driver.id, 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve Driver
                            </DropdownMenuItem>
                        )}
                        {driver.status !== 'blocked' && (
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onUpdateStatus(driver.id, 'blocked')}
                            >
                               <XCircle className="mr-2 h-4 w-4" /> Block Driver
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )
    },
  },
];
