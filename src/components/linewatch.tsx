
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { DashboardData, ChartDataPoint, DistributionPoint } from '@/lib/types';
import { Zap, Power, AlertTriangle, Bot, Home as HomeIcon, Lightbulb, Server, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Defs, linearGradient, Stop } from 'recharts';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toggleRelay, updateSafetyThreshold, getAllFilesAsJson } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const chartConfig = {
  averageCurrent: {
    label: 'Average Current',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const LineWatchHeader = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const correctPassword = "linewatch2024";

    const handleDownload = async () => {
        setError('');
        if (password !== correctPassword) {
            setError('Incorrect password. Please try again.');
            return;
        }

        setIsDownloading(true);
        setIsDialogOpen(false); 
        try {
            const files = await getAllFilesAsJson();
            const zip = new JSZip();

            for (const [path, content] of Object.entries(files)) {
                zip.file(path, content);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, 'linewatch-ai-source-code.zip');
        } catch (error) {
            console.error("Failed to download source code:", error);
        } finally {
            setIsDownloading(false);
            setPassword('');
        }
    };

    const onOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setPassword('');
            setError('');
        }
    }
    
    return (
        <header className="flex items-center justify-between gap-3 px-8 py-4 border-b">
            <div className="flex items-center gap-3">
                <Zap className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">LineWatch AI</h1>
            </div>
            <AlertDialog open={isDialogOpen} onOpenChange={onOpenChange}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={isDownloading}>
                        <Download className="mr-2 h-4 w-4" />
                        {isDownloading ? 'Downloading...' : 'Download Source Code'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Enter Password to Download</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please enter the password to download the source code folder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDownload} disabled={!password}>
                            Download
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    )
};

const ControlPanel = ({ data, onRelayToggle, onThresholdChange }: { data: DashboardData; onRelayToggle: (id: string, status: boolean) => void, onThresholdChange: (value: number) => void }) => {
    const [threshold, setThreshold] = useState(data.safetyThreshold);
    const debouncedThreshold = useDebounce(threshold, 500);

    useEffect(() => {
        if (debouncedThreshold !== data.safetyThreshold) {
            onThresholdChange(debouncedThreshold);
        }
    }, [debouncedThreshold, onThresholdChange, data.safetyThreshold]);

    useEffect(() => {
        setThreshold(data.safetyThreshold);
    }, [data.safetyThreshold]);


    return (
        <aside className="w-full md:w-80 lg:w-96 p-6 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Control Panel</CardTitle>
                    <CardDescription>Monitor and control the power line.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="mb-2 font-semibold">Main Controls</h3>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <Power className="w-5 h-5" />
                                <span className="font-medium">{data.transformer.name}</span>
                            </div>
                            <Switch 
                                checked={data.transformer.relay.isOn} 
                                onCheckedChange={(checked) => onRelayToggle(data.transformer.relay.id, checked)}
                                aria-label="Toggle Main Transformer"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 font-semibold">Safety Threshold (Amps)</h3>
                        <div className="relative">
                            <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                                type="number" 
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="pl-10"
                                aria-label="Safety Threshold"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5"/>
                        AI Alerts & Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.alerts && data.alerts.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {data.alerts.map((alert, index) => (
                                <li key={index} className="text-destructive">{alert}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No AI activity yet.</p>
                    )}
                </CardContent>
            </Card>
        </aside>
    );
}

const SensorCard = ({ point, safetyThreshold, onRelayToggle }: { point: DistributionPoint, safetyThreshold: number, onRelayToggle: (id: string, status: boolean) => void }) => {
    const isOverload = point.current > safetyThreshold;
    const isRelayOn = point.isOn;
  
    return (
      <Card className={cn("w-60 flex-shrink-0 transition-all", isOverload && isRelayOn ? 'border-destructive animate-pulse' : 'border-border')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lightbulb className={cn("w-5 h-5", isRelayOn ? "text-primary" : "text-muted-foreground")} />
              <span className="font-semibold text-sm">{point.name}</span>
            </div>
            <p className={cn(
              "font-bold text-2xl",
              isOverload && isRelayOn ? "text-destructive" : "text-foreground"
            )}>
              {point.current.toFixed(2)} <span className="text-lg font-normal">A</span>
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
             <div className="flex items-center gap-1.5">
                <HomeIcon className="w-3.5 h-3.5"/>
                <span>{point.housesConnected}</span>
            </div>
            <div className="flex items-center gap-2">
                <span>Relay</span>
                <Switch 
                    checked={isRelayOn} 
                    onCheckedChange={(checked) => onRelayToggle(point.id, checked)}
                    aria-label={`Toggle relay for ${point.name}`}
                    className="h-5 w-9 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                />
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

const TransformerCard = ({ data }: { data: DashboardData }) => {
    return (
        <Card className="w-60 flex-shrink-0 border-primary/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Server className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-sm">{data.transformer.name}</span>
                    </div>
                     <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        data.transformer.relay.isOn ? "bg-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                        {data.transformer.relay.isOn ? 'ON' : 'OFF'}
                    </span>
                </div>
                 <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    <p>Relay ID: {data.transformer.relay.id}</p>
                 </div>
            </CardContent>
        </Card>
    );
};

const ConnectingLine = () => (
    <div className="w-16 h-1 flex-shrink-0 bg-border" />
);


const Dashboard = ({ data, chartData, onRelayToggle }: { data: DashboardData, chartData: ChartDataPoint[], onRelayToggle: (id: string, status: boolean) => void }) => {
    return (
        <main className="flex-1 p-6 flex flex-col gap-8">
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex items-center gap-4">
                    <TransformerCard data={data} />
                    {data.distributionPoints.map((point) => (
                        <div key={point.id} className="flex items-center gap-4">
                             <ConnectingLine />
                             <SensorCard point={point} safetyThreshold={data.safetyThreshold} onRelayToggle={onRelayToggle} />
                        </div>
                    ))}
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Average Current</CardTitle>
                    <CardDescription>Real-time average current across all active sensors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart 
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                isAnimationActive={true}
                                animationDuration={300}
                                >
                                <defs>
                                    <linearGradient id="colorAverageCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-averageCurrent)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-averageCurrent)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="time" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={8}
                                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={8}
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                />
                                <ChartTooltip 
                                    cursor={true}
                                    content={<ChartTooltipContent indicator="line" labelClassName="font-bold" />}
                                />
                                <Area
                                    dataKey="averageCurrent"
                                    type="monotone"
                                    fill="url(#colorAverageCurrent)"
                                    stroke="var(--color-averageCurrent)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

const LoadingSkeleton = () => (
    <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between gap-3 px-8 py-4 border-b">
            <div className='flex items-center gap-3'>
                <Skeleton className="w-7 h-7" />
                <Skeleton className="h-7 w-48" />
            </div>
            <Skeleton className="h-9 w-44" />
        </header>
        <div className="flex flex-1">
            <aside className="w-full md:w-80 lg:w-96 p-6 flex flex-col gap-6 border-r">
                <Skeleton className="h-48 w-full"/>
                <Skeleton className="h-full w-full"/>
            </aside>
            <main className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-28 w-60" />
                     {[...Array(4)].map((_, i) =>
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-16 h-1" />
                            <Skeleton className="h-28 w-60" />
                        </div>
                     )}
                 </div>
                 <Skeleton className="h-full w-full"/>
            </main>
        </div>
    </div>
)

export default function LineWatch({ initialData }: { initialData: DashboardData }) {
    const [data, setData] = useState<DashboardData>(initialData);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        setIsMounted(true);

        const unsub = onSnapshot(doc(db, "dashboard", "data"), (doc) => {
            if (doc.exists()) {
                const remoteData = doc.data() as DashboardData;
                setData(remoteData);

                const onPoints = remoteData.distributionPoints.filter(p => p.isOn);
                const avg = onPoints.length > 0 ? onPoints.reduce((sum, p) => sum + p.current, 0) / onPoints.length : 0;

                setChartData(prev => {
                    const newPoint = { time: new Date().toISOString(), averageCurrent: parseFloat(avg.toFixed(2)) };
                    const newData = [...prev, newPoint];
                    return newData.length > 20 ? newData.slice(newData.length - 20) : newData;
                });
            }
        });

        return () => {
            unsub();
            document.documentElement.classList.remove('dark');
        };
    }, []);

    const handleRelayToggle = (id: string, status: boolean) => {
        toggleRelay(id, status);
    };



    const handleThresholdChange = (value: number) => {
        updateSafetyThreshold(value);
    }
    
    if (!isMounted || !data.transformer) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <LineWatchHeader />
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
                <ControlPanel data={data} onRelayToggle={handleRelayToggle} onThresholdChange={handleThresholdChange} />
                <div className="flex-1 overflow-auto">
                    <Dashboard data={data} chartData={chartData} onRelayToggle={handleRelayToggle} />
                </div>
            </div>
        </div>
    );
}
