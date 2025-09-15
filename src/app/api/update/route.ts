
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { DashboardData, DistributionPoint } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.distributionPoints || typeof body.distributionPoints !== 'object') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const dashboardDocRef = doc(db, 'dashboard', 'data');
    const docSnap = await getDoc(dashboardDocRef);

    if (!docSnap.exists()) {
         return NextResponse.json({ error: 'Dashboard data not found' }, { status: 404 });
    }
    
    const dashboardData = docSnap.data() as DashboardData;

    // Handle both array and object for distributionPoints
    if (Array.isArray(dashboardData.distributionPoints)) {
        const updates = body.distributionPoints as (Partial<DistributionPoint> & { id: string })[];
        updates.forEach(point => {
          if (point.id && typeof point.current === 'number') {
            const dpIndex = dashboardData.distributionPoints.findIndex(dp => dp.id === point.id);
            if (dpIndex !== -1) {
                dashboardData.distributionPoints[dpIndex].current = point.current;
            }
          }
        });
    } else { // Old object structure
        const updates = body.distributionPoints as Record<string, { current: number }>;
        for (const id in updates) {
            if (dashboardData.distributionPoints[id as any]) {
                (dashboardData.distributionPoints as any)[id].current = updates[id].current;
            }
        }
    }


    await setDoc(dashboardDocRef, dashboardData, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating Firestore:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function GET() {
    return NextResponse.json({ message: "This endpoint is for POST requests from the ESP32." });
}
