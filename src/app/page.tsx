import LineWatch from '../components/linewatch';
import { getDashboardData } from './actions';

// Trigger new deployment
export default async function Home() {
  const initialData = await getDashboardData();
  return <LineWatch initialData={initialData} />;
}
