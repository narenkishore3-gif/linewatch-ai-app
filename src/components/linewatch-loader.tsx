
'use client';

import dynamic from 'next/dynamic';
import type { DashboardData } from '../lib/types';
import { Skeleton } from './ui/skeleton';

const LoadingSkeleton = () => (
    <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between gap-3 px-8 py-4 border-b border-border">
            <div className='flex items-center gap-3'>
                <Skeleton className="w-7 h-7" />
                <Skeleton className="h-7 w-48" />
            </div>
            <Skeleton className="h-9 w-44" />
        </header>
        <div className="flex flex-1 overflow-hidden">
            <aside className="w-full md:w-80 lg:w-96 p-6 flex-col gap-6 border-r border-border hidden md:flex">
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-full w-full"/>
            </aside>
            <main className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4 overflow-x-auto pb-4">
                    <Skeleton className="h-28 w-60 flex-shrink-0" />
                     {[...Array(4)].map((_, i) =>
                        <div key={i} className="flex items-center gap-4 flex-shrink-0">
                            <Skeleton className="w-16 h-1" />
                            <Skeleton className="h-28 w-60" />
                        </div>
                     )}
                 </div>
                 <Skeleton className="h-full w-full"/>
            </main>
        </div>
    </div>
);


const LineWatchClient = dynamic(() => import('../components/linewatch'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});


export default function LineWatchLoader({ initialData }: { initialData: DashboardData }) {
    return <LineWatchClient initialData={initialData} />;
}

