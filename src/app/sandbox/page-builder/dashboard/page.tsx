import type { Metadata } from 'next';

import PageBuilderDashboard from '../dashboard';

export const metadata: Metadata = {
  title: 'CMS Dashboard — Page Builder Sandbox',
};

export default function PageBuilderDashboardPage() {
  return <PageBuilderDashboard />;
}
