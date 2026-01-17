import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/templates')({
  ssr: false,
  component: TemplatesLayout,
  loader: () => ({
    breadcrumb: {
      title: 'Шаблоны',
    },
  }),
});

function TemplatesLayout() {
  return <Outlet />;
}
