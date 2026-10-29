import { MainTemplate } from '@/components/templates';
import { OverviewDashboard } from '@/modules/overview';

export default function HomePage() {
  return (
    <MainTemplate>
      <OverviewDashboard />
    </MainTemplate>
  );
}
