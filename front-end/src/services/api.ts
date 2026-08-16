// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface SiteDashboardData {
  structuralHealth: string;
  beamsInspection: number;
  foreignAlerts: number;
  inventory: string;
  capacity: string;
}

export interface BeamData {
  id: string;
  location: string;
  status: 'good' | 'warning' | 'critical';
  stress: number;
  lastInspection: string;
}

export interface StressDataPoint {
  date: string;
  beam1: number | null;
  beam2?: number | null;
  average: number;
}

export interface DetectionData {
  id: number;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  status: 'active' | 'resolved';
  imageUrl?: string;
  cameraId?: string;
}

export interface BarnInventory {
  id: number;
  name: string;
  current: number;
  capacity: number;
  status: 'good' | 'warning' | 'critical';
  change: string;
}

export interface VolumeDataPoint {
  date: string;
  total: number;
}

// API Error Handler
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Dashboard API
export const dashboardApi = {
  async getSiteData(site: string): Promise<SiteDashboardData> {
    return fetchApi(`/dashboard/${encodeURIComponent(site)}`);
  },

  async getAllSites(): Promise<string[]> {
    return fetchApi('/dashboard/sites');
  },
};

// Structural Monitoring API
export const structuralApi = {
  async getBeams(site: string): Promise<{
    totalBeams: number;
    healthy: number;
    warning: number;
    beams: BeamData[];
    stressData: StressDataPoint[];
  }> {
    return fetchApi(`/structural/${encodeURIComponent(site)}`);
  },

  async updateBeamStatus(beamId: string, siteId: string, status: 'good' | 'warning' | 'critical'): Promise<void> {
    return fetchApi(`/structural/beams/${beamId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, siteId }),
    });
  },
};

// Foreign Material Detection API
export const detectionApi = {
  async getDetections(site: string): Promise<{
    activeAlerts: number;
    resolvedToday: number;
    cameras: number;
    accuracy: string;
    detections: DetectionData[];
    weeklyData: Array<{ day: string; seeds: number; droppings: number; dust: number }>;
  }> {
    return fetchApi(`/detections/${encodeURIComponent(site)}`);
  },

  async resolveDetection(detectionId: string, siteId: string): Promise<void> {
    return fetchApi(`/detections/${detectionId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ siteId }),
    });
  },
};

// Inventory Monitoring API
export const inventoryApi = {
  async getInventory(site: string): Promise<{
    totalInventory: string;
    totalChange: string;
    totalCapacity: number;
    avgDailyChange: string;
    barns: BarnInventory[];
    volumeData: VolumeDataPoint[];
  }> {
    return fetchApi(`/inventory/${encodeURIComponent(site)}`);
  },

  async updateBarnInventory(barnId: string, siteId: string, amount: number): Promise<void> {
    return fetchApi(`/inventory/barns/${barnId}`, {
      method: 'PUT',
      body: JSON.stringify({ amount, siteId }),
    });
  },
};
