
'use server';

import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { DashboardData, DistributionPoint } from '../lib/types';
import * as fs from 'fs/promises';
import * as path from 'path';

async function initializeData() {
  const dashboardDocRef = doc(db, 'dashboard', 'data');
  const docSnap = await getDoc(dashboardDocRef);

  if (docSnap.exists()) {
    // Check if safetyThreshold exists, if not, add it.
    const data = docSnap.data();
    if (data.safetyThreshold === undefined) {
      await updateDoc(dashboardDocRef, { safetyThreshold: 20, alerts: [] });
    }
     // Check for the new distribution point
    if (!data.distributionPoints.some((dp: DistributionPoint) => dp.id === 'dp-7')) {
       const newPoint: DistributionPoint = { id: "dp-7", name: "Point 7", current: 8.42, isOn: true, housesConnected: 5 };
       await updateDoc(dashboardDocRef, {
        distributionPoints: [...data.distributionPoints, newPoint]
      });
    }
    return;
  }

  const initialData: DashboardData = {
    transformer: {
      id: "transformer-1",
      name: "Main Transformer",
      relay: {
        id: "relay-t1",
        name: "Transformer Relay",
        isOn: true
      }
    },
    distributionPoints: [
      { id: "dp-1", name: "Point 1", current: 11.63, isOn: true, housesConnected: 5 },
      { id: "dp-2", name: "Point 2", current: 10.54, isOn: true, housesConnected: 7 },
      { id: "dp-3", name: "Point 3", current: 10.24, isOn: true, housesConnected: 4 },
      { id: "dp-4", name: "Point 4", current: 16.55, isOn: true, housesConnected: 6 },
      { id: "dp-5", name: "Point 5", current: 12.56, isOn: true, housesConnected: 8 },
      { id: "dp-6", name: "Point 6", current: 9.78, isOn: true, housesConnected: 3 },
      { id: "dp-7", name: "Point 7", current: 8.42, isOn: true, housesConnected: 5 },
    ],
    safetyThreshold: 20,
    alerts: [],
  };

  await setDoc(dashboardDocRef, initialData);
  console.log('Firestore data initialization complete.');
}


export async function getDashboardData(): Promise<DashboardData> {
  try {
    await initializeData();
    const dashboardDocRef = doc(db, 'dashboard', 'data');
    const docSnap = await getDoc(dashboardDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as DashboardData;
    } else {
        throw new Error("Could not find dashboard data after initialization.");
    }

  } catch (error) {
    console.error("Error fetching initial data:", error);
    return {
      transformer: { id: 'transformer-1', name: 'Main Transformer', relay: { id: 'relay-t1', name: 'Transformer Relay', isOn: false } },
      distributionPoints: [],
      safetyThreshold: 20,
      alerts: []
    };
  }
}

export async function toggleRelay(id: string, status: boolean): Promise<void> {
  try {
    const dashboardDocRef = doc(db, 'dashboard', 'data');
    const docSnap = await getDoc(dashboardDocRef);

    if (!docSnap.exists()) {
        throw new Error("Dashboard data not found");
    }

    const data = docSnap.data() as DashboardData;
    let updated = false;

    if (data.transformer.relay.id === id) {
        data.transformer.relay.isOn = status;
        updated = true;
    } else {
        const dpIndex = data.distributionPoints.findIndex(dp => dp.id === id);
        if (dpIndex !== -1) {
            data.distributionPoints[dpIndex].isOn = status;
            updated = true;
        }
    }
    
    if(updated) {
        await setDoc(dashboardDocRef, data);
    }

  } catch (error) {
    console.error("Error toggling relay:", error);
  }
}

export async function updateSafetyThreshold(threshold: number): Promise<void> {
  try {
    const dashboardDocRef = doc(db, 'dashboard', 'data');
    await updateDoc(dashboardDocRef, { safetyThreshold: threshold });
  } catch (error) {
    console.error("Error updating safety threshold:", error);
  }
}

const ignoredFiles = new Set(['.DS_Store']);
const ignoredFolders = new Set(['.next', 'node_modules']);
const allowedExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.md',
  '.html',
  '.yaml',
  'rc'
]);

async function getFiles(dir: string, rootDir: string): Promise<Record<string, string>> {
  let files: Record<string, string> = {};
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredFolders.has(entry.name)) {
        const nestedFiles = await getFiles(fullPath, rootDir);
        files = { ...files, ...nestedFiles };
      }
    } else if (!ignoredFiles.has(entry.name) && allowedExtensions.has(path.extname(entry.name))) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const relativePath = path.relative(rootDir, fullPath);
        files[relativePath] = content;
      } catch (e) {
         console.error(`Could not read file ${fullPath}:`, e);
      }
    }
  }
  return files;
}

export async function getAllFilesAsJson(): Promise<Record<string, string>> {
    const projectRoot = process.cwd();
    return await getFiles(projectRoot, projectRoot);
}
