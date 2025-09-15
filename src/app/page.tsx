import LineWatch from '../components/linewatch';
import { getDashboardData } from './actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialData = await getDashboardData();
  return <LineWatch initialData={initialData} />;
}
