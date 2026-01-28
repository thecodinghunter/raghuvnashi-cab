'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, UserX, UserCheck, History } from 'lucide-react';
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
import type { UserProfile } from '@/lib/types';
import { ViewUserHistoryModal } from './ViewUserHistoryModal';


const StatusBadge = ({ status }: { status: UserProfile['status'] }) => {
  switch (status) {
    case 'suspended':
      return (
        <Badge variant="destructive">
          <UserX className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    case 'active':
    default:
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <UserCheck className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
  }
};

type ColumnsProps = {
  onUpdateStatus: (userId: string, status: 'active' | 'suspended') => void;
};

export const columns = ({ onUpdateStatus }: ColumnsProps): ColumnDef<UserProfile>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => row.original.phoneNumber || 'N/A',
  },
    {
    accessorKey: 'totalRides',
    header: 'Total Rides',
     cell: ({ row }) => <div className="text-center">{row.original.totalRides || 0}</div>,
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
        const user = row.original;
        const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
        return (
            <>
                <ViewUserHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    user={user}
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
                        <DropdownMenuItem onClick={() => setIsHistoryModalOpen(true)}>
                           <History className="mr-2 h-4 w-4" />
                            View Ride History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onUpdateStatus(user.id, 'suspended')}
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )
    },
  },
];
