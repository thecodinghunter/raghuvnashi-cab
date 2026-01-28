'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, CheckCircle, XCircle, Clock, AlertTriangle, TrafficCone } from 'lucide-react';
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
import type { Ride } from '@/lib/types';
import { ViewRideDetailsModal } from './ViewRideDetailsModal';

const StatusBadge = ({ status }: { status: Ride['status'] }) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      );
    case 'In Progress':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <TrafficCone className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      );
    case 'Disputed':
        return (
            <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-300">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Disputed
            </Badge>
        )
    case 'Requested':
    default:
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />
          Requested
        </Badge>
      );
  }
};

export const columns: ColumnDef<Ride>[] = [
  {
    accessorKey: 'id',
    header: 'Ride ID',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>
  },
  {
    accessorKey: 'userName',
    header: 'User',
  },
  {
    accessorKey: 'driverName',
    header: 'Driver',
  },
  {
    accessorKey: 'fare',
    header: ({ column }) => {
      return (
        <div className="text-right">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
            Fare
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      );
    },
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("fare"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
   
        return <div className="text-right font-medium">{formatted}</div>
      },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
        const ride = row.original;
        const [isModalOpen, setIsModalOpen] = useState(false);
        return (
            <>
                <ViewRideDetailsModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    ride={ride}
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
                        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                            View Ride Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                        >
                            Cancel Ride
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )
    },
  },
];
