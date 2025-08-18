import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Header from '@/components/blocks/header';
import { Button } from '@/components/ui/button';
import Endpoint from '@/api/endpoints';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_admin/vendors')({
  component: RouteComponent,
});

function StatCard({ title, value, badge }: { title: string; value: number | string; badge?: string }) {
  return (
    <Card className="@container/card flex-1 min-w-[220px] max-w-full">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {badge && <Badge variant="outline">{badge}</Badge>}
      </CardHeader>
    </Card>
  );
}

function RouteComponent() {
  const qc = useQueryClient();
  const { data: analytics, isLoading: aLoading } = useQuery({
    queryKey: ['vendors-analytics'],
    queryFn: Endpoint.getVendorsAnalytics,
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // debounce search
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { status: 'all', search: debouncedSearch, page, limit }],
    queryFn: () => Endpoint.getVendors({ status: 'all', search: debouncedSearch, page, limit }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => Endpoint.approveVendor(id, isApproved),
    onSuccess: () => {
  qc.invalidateQueries({ queryKey: ['vendors'] });
      qc.invalidateQueries({ queryKey: ['vendors-analytics'] });
    },
  });

  const header = (
    <Header title="Vendors" subText="Manage and approve vendors">
      {/* Optional actions */}
    </Header>
  );

  if (isLoading || aLoading) {
    return (
      <>
        {header}
        <div className="space-y-6">
          <div className="flex gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  const list = data?.data?.items || [];
  const meta = data?.data || {} as any;
  const stats = analytics?.data || {};

  return (
    <>
      {header}
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard title="Total Vendors" value={stats.totalVendors || 0} badge={`${stats.trendingChange ?? 0}%`} />
        <StatCard title="Approved" value={stats.approvedVendors || 0} />
        <StatCard title="Pending" value={stats.pendingVendors || 0} />
        <StatCard title="Active" value={stats.activeVendors || 0} />
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search vendors (name, owner, location)"
          className="border rounded px-3 py-2 w-full sm:w-80"
        />
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-2">
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm">Page {meta.page || 1} / {meta.totalPages || 1}</span>
          <Button variant="outline" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Restaurant</th>
              <th className="p-3">Type</th>
              <th className="p-3">Location</th>
              <th className="p-3">Approved</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v: any) => (
              <tr key={v._id} className="border-b hover:bg-muted/20">
                <td className="p-3 font-medium">{v.restaurantName}</td>
                <td className="p-3">{v.vendorType}</td>
                <td className="p-3">{v.location}</td>
                <td className="p-3">{v.isApproved ? <Badge variant="outline">Yes</Badge> : <Badge variant="destructive">No</Badge>}</td>
                <td className="p-3">{v.isActive ? <Badge variant="outline">Yes</Badge> : <Badge variant="destructive">No</Badge>}</td>
                <td className="p-3 space-x-2">
                  {v.isApproved ? (
                    <Button variant="secondary" size="sm" onClick={() => approveMutation.mutate({ id: v._id, isApproved: false })} disabled={approveMutation.isPending}>
                      Unapprove
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: v._id, isApproved: true })} disabled={approveMutation.isPending}>
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// small debounce hook local to file
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
