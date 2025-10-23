
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export interface ReturnRequest {
  id: number;
  createdAt: string;
  status: string;
  receiptId: string;
}

export const columns: ColumnDef<ReturnRequest>[] = [
  {
    accessorKey: 'receiptId',
    header: 'Order ID',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString();
      },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.original.status;
        let variant: "secondary" | "outline" | "destructive" = 'secondary';
        if (status === 'Accepted') variant = 'secondary';
        if (status === 'Denied') variant = 'destructive';
        if (status === 'Processing') variant = 'outline';
  
        return <Badge variant={variant}>{status}</Badge>;
      },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const returnId = row.original.id;
      return (
        <Link href={`/admin/returns/${returnId}`} passHref>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
