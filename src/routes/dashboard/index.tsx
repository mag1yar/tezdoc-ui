import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const Route = createFileRoute('/dashboard/')({
  ssr: false,
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 pt-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
        </CardContent>
      </Card>
    </div>
  );
}
