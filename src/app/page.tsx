
import { getDashboardData } from './actions';
import LineWatchLoader from '../components/linewatch-loader';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialData = await getDashboardData();
  return <LineWatchLoader initialData={initialData} />;
}
