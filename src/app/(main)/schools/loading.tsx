import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SchoolsLoading() {
  return (
    <div className="container-wrapper py-8">
      <div className="container-content">
        <div className="container-inner">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mb-4" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Filters Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schools List Skeleton */}
            <div className="space-y-6">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 bg-muted animate-pulse rounded flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-full bg-muted animate-pulse rounded" />
                          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                          <div className="flex gap-2 mt-4">
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 w-16 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

