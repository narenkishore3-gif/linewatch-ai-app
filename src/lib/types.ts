export interface Relay {
  id: string;
  name: string;
  isOn: boolean;
}

export interface Transformer {
  id: string;
  name: string;
  relay: Relay;
}

export interface DistributionPoint {
  id: string;
  name: string;
  current: number;
  isOn: boolean;
  housesConnected: number;
}

export interface DashboardData {
    transformer: Transformer;
    distributionPoints: DistributionPoint[];
    safetyThreshold: number;
    alerts: string[];
}

export interface ChartDataPoint {
  time: string;
  averageCurrent: number;
}
