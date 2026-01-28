'use client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, CheckCircle, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Complaint } from '@/lib/types';

const StatusBadge = ({ status }: { status: Complaint['status'] }) => {
  switch (status) {
    case 'Resolved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Resolved
        </Badge>
      );
    case 'Open':
    default:
      return (
        <Badge variant="destructive">
          <ShieldQuestion className="mr-1 h-3 w-3" />
          Open
        </Badge>
      );
  }
};

type ColumnsProps = {
  onMarkAsResolved: (complaintId: string) => void;
};

export const columns = ({ onMarkAsResolved }: ColumnsProps): ColumnDef<Complaint>[] => [
  {
    accessorKey: 'id',
    header: 'Complaint ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.id}</div>
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="pl-4">{row.original.userName}</div>
  },
  {
    accessorKey: 'rideId',
    header: 'Ride ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.original.rideId}</div>
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
            {row.original.message}
        </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
      const complaint = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {complaint.status === 'Open' && (
              <DropdownMenuItem onClick={() => onMarkAsResolved(complaint.id)}>
                Mark as Resolved
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
