import LineWatch from '@/components/linewatch';
import { getDashboardData } from '@/app/actions';

export default async function Home() {
  const initialData = await getDashboardData();
  return <LineWatch initialData={initialData} />;
}
