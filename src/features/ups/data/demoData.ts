import type {
  AlarmEvent,
  Event,
  EventSeverity,
  EventType,
  GovernorateConfig,
  GovernorateOverview,
  KpiSummary,
  LandingOverview,
  ReadingStatus,
  ScheduledReport,
  Site,
  SiteData,
  SiteDetails,
  SiteReading,
  SiteSummary,
  SiteStatus,
  SystemKPIs,
  TimeSeriesPoint,
  User,
  DemoDataSet,
} from "../types";

const now = new Date();
const baseDate = new Date("2026-02-04T00:00:00Z");

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

// Utility functions for generating realistic data patterns
const generateRealisticValue = (base: number, variation: number, trend: number = 0): number => {
  const randomVariation = (Math.random() - 0.5) * variation;
  return round(base + randomVariation + trend, 2);
};

const generateBatteryPattern = (baseVoltage: number, hours: number): number => {
  // Battery follows charge/discharge cycles
  const cyclePosition = (hours % 24) / 24; // 0-1 through day
  const chargePattern = Math.sin(cyclePosition * Math.PI * 2) * 0.3;
  return round(baseVoltage + chargePattern, 2);
};

const buildSeries = (
  start: Date,
  points: number,
  stepMinutes: number,
  base: Pick<SiteSummary, "upstream" | "downstream" | "batteryVoltage" | "flowRate">,
): TimeSeriesPoint[] => {
  return Array.from({ length: points }, (_, index) => {
    const ts = new Date(start.getTime() + index * stepMinutes * 60 * 1000);
    const hours = index * (stepMinutes / 60);
    
    // More realistic patterns
    const upstreamDrift = Math.sin(hours / 6) * 0.15 + Math.random() * 0.1 - 0.05;
    const downstreamDrift = upstreamDrift * 0.85 + Math.random() * 0.08 - 0.04;
    const flowVariation = Math.cos(hours / 4) * 0.5 + Math.random() * 0.3 - 0.15;
    
    return {
      timestamp: ts.toISOString(),
      upstream: round(base.upstream + upstreamDrift, 2),
      downstream: round(base.downstream + downstreamDrift, 2),
      batteryVoltage: generateBatteryPattern(base.batteryVoltage, hours),
      flowRate: round(Math.max(0, base.flowRate + flowVariation), 2),
    };
  });
};

const buildDailySeries = (
  start: Date,
  days: number,
  base: Pick<SiteSummary, "upstream" | "downstream" | "batteryVoltage" | "flowRate">,
): TimeSeriesPoint[] => {
  let cumulativeFlow = 0;
  return Array.from({ length: days }, (_, index) => {
    const ts = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
    
    // Daily averages with seasonal trends
    const seasonalTrend = Math.sin((index / 365) * Math.PI * 2) * 0.2;
    const upstreamAvg = base.upstream + seasonalTrend + (Math.random() - 0.5) * 0.1;
    const downstreamAvg = base.downstream + seasonalTrend * 0.8 + (Math.random() - 0.5) * 0.08;
    const batteryAvg = base.batteryVoltage + (Math.random() - 0.5) * 0.2;
    const dailyFlow = Math.max(0, base.flowRate + (Math.random() - 0.5) * 1.0);
    
    cumulativeFlow += dailyFlow;
    
    return {
      timestamp: ts.toISOString(),
      upstream: round(upstreamAvg, 2),
      downstream: round(downstreamAvg, 2),
      batteryVoltage: round(batteryAvg, 2),
      flowRate: round(cumulativeFlow, 2),
    };
  });
};

// Legacy site data structure for easier maintenance
const legacySites = [
  // Aswan Governorate (Southernmost)
  { id: 1, name: "Aswan High Dam", governorate: "Aswan", branch: "Main Canal", status: "active", lat: 24.0084, lng: 32.8998, positionOrder: 1, upstream: 6.8, downstream: 6.2, batteryVoltage: 12.9, flowRate: 25.4 },
  { id: 2, name: "Kom Ombo", governorate: "Aswan", branch: "Main Canal", status: "active", lat: 24.4667, lng: 32.9500, positionOrder: 2, upstream: 6.5, downstream: 5.9, batteryVoltage: 12.8, flowRate: 24.1 },
  { id: 3, name: "Edfu", governorate: "Aswan", branch: "Main Canal", status: "active", lat: 24.9833, lng: 32.8667, positionOrder: 3, upstream: 6.3, downstream: 5.7, batteryVoltage: 12.7, flowRate: 23.8 },
  
  // Luxor Governorate
  { id: 4, name: "Luxor East", governorate: "Luxor", branch: "Main Canal", status: "active", lat: 25.6872, lng: 32.6396, positionOrder: 4, upstream: 6.1, downstream: 5.5, batteryVoltage: 12.6, flowRate: 23.2 },
  { id: 5, name: "Luxor West", governorate: "Luxor", branch: "Main Canal", status: "maintenance", lat: 25.6872, lng: 32.6096, positionOrder: 5, upstream: 5.9, downstream: 5.3, batteryVoltage: 12.1, flowRate: 22.5 },
  
  // Qena Governorate
  { id: 6, name: "Qena North", governorate: "Qena", branch: "Main Canal", status: "active", lat: 26.1551, lng: 32.7160, positionOrder: 6, upstream: 5.8, downstream: 5.2, batteryVoltage: 12.5, flowRate: 22.1 },
  { id: 7, name: "Qena South", governorate: "Qena", branch: "Main Canal", status: "active", lat: 26.1351, lng: 32.6960, positionOrder: 7, upstream: 5.7, downstream: 5.1, batteryVoltage: 12.4, flowRate: 21.8 },
  { id: 8, name: "Nag Hammadi", governorate: "Qena", branch: "Main Canal", status: "active", lat: 26.2549, lng: 32.2421, positionOrder: 8, upstream: 5.6, downstream: 5.0, batteryVoltage: 12.3, flowRate: 21.4 },
  
  // Sohag Governorate
  { id: 9, name: "Sohag Central", governorate: "Sohag", branch: "Main Canal", status: "active", lat: 26.5569, lng: 31.6948, positionOrder: 9, upstream: 5.5, downstream: 4.9, batteryVoltage: 12.2, flowRate: 21.0 },
  { id: 10, name: "Girga", governorate: "Sohag", branch: "Main Canal", status: "active", lat: 26.3391, lng: 31.8917, positionOrder: 10, upstream: 5.4, downstream: 4.8, batteryVoltage: 12.1, flowRate: 20.6 },
  { id: 11, name: "Akhmim", governorate: "Sohag", branch: "Main Canal", status: "inactive", lat: 26.5667, lng: 31.7500, positionOrder: 11, upstream: 5.3, downstream: 4.7, batteryVoltage: 11.8, flowRate: 20.2 },
  
  // Asyut Governorate
  { id: 12, name: "Asyut Barrage", governorate: "Asyut", branch: "Main Canal", status: "active", lat: 27.1809, lng: 31.1837, positionOrder: 12, upstream: 5.2, downstream: 4.6, batteryVoltage: 12.0, flowRate: 19.8 },
  { id: 13, name: "Asyut East", governorate: "Asyut", branch: "Ibrahimiya", status: "active", lat: 27.1809, lng: 31.2037, positionOrder: 13, upstream: 5.1, downstream: 4.5, batteryVoltage: 12.4, flowRate: 19.4 },
  { id: 14, name: "Dayrout", governorate: "Asyut", branch: "Ibrahimiya", status: "active", lat: 27.5333, lng: 30.8000, positionOrder: 14, upstream: 5.0, downstream: 4.4, batteryVoltage: 12.3, flowRate: 19.0 },
  
  // Minia Governorate - Ibrahimiya Branch
  { id: 15, name: "Minia North", governorate: "Minia", branch: "Ibrahimiya", status: "active", lat: 28.115, lng: 30.75, positionOrder: 15, upstream: 5.4, downstream: 4.8, batteryVoltage: 12.6, flowRate: 18.4 },
  { id: 16, name: "Minia South", governorate: "Minia", branch: "Ibrahimiya", status: "active", lat: 27.9, lng: 30.9, positionOrder: 16, upstream: 5.1, downstream: 4.6, batteryVoltage: 12.5, flowRate: 17.8 },
  { id: 17, name: "Abu Qurqas", governorate: "Minia", branch: "Ibrahimiya", status: "inactive", lat: 27.93, lng: 30.84, positionOrder: 17, upstream: 4.9, downstream: 4.3, batteryVoltage: 12.2, flowRate: 16.1 },
  { id: 18, name: "Mallawi", governorate: "Minia", branch: "Ibrahimiya", status: "active", lat: 27.73, lng: 30.84, positionOrder: 18, upstream: 5.0, downstream: 4.4, batteryVoltage: 12.3, flowRate: 16.9 },
  { id: 19, name: "Samalut", governorate: "Minia", branch: "Ibrahimiya", status: "active", lat: 28.3167, lng: 30.7167, positionOrder: 19, upstream: 5.2, downstream: 4.6, batteryVoltage: 12.4, flowRate: 17.2 },
  
  // Minia Governorate - Bahr Youssef Branch
  { id: 20, name: "Bahr Youssef Head", governorate: "Minia", branch: "Bahr Youssef", status: "active", lat: 28.65, lng: 30.84, positionOrder: 20, upstream: 5.7, downstream: 5.0, batteryVoltage: 12.7, flowRate: 19.2 },
  { id: 21, name: "Maghagha", governorate: "Minia", branch: "Bahr Youssef", status: "active", lat: 28.64, lng: 30.83, positionOrder: 21, upstream: 5.6, downstream: 4.9, batteryVoltage: 12.6, flowRate: 18.8 },
  { id: 22, name: "Beni Mazar", governorate: "Minia", branch: "Bahr Youssef", status: "active", lat: 28.5000, lng: 30.8000, positionOrder: 22, upstream: 5.5, downstream: 4.8, batteryVoltage: 12.5, flowRate: 18.4 },
  
  // Beni Suef Governorate
  { id: 23, name: "Beni Suef East", governorate: "Beni Suef", branch: "Bahr Youssef", status: "active", lat: 29.07, lng: 31.1, positionOrder: 23, upstream: 5.9, downstream: 5.2, batteryVoltage: 12.8, flowRate: 19.7 },
  { id: 24, name: "Beni Suef West", governorate: "Beni Suef", branch: "Bahr Youssef", status: "active", lat: 29.07, lng: 31.08, positionOrder: 24, upstream: 5.8, downstream: 5.1, batteryVoltage: 12.7, flowRate: 19.3 },
  { id: 25, name: "Wasta", governorate: "Beni Suef", branch: "Ibrahimiya", status: "active", lat: 29.3400, lng: 31.2067, positionOrder: 25, upstream: 5.5, downstream: 4.8, batteryVoltage: 12.5, flowRate: 18.6 },
  
  // Fayoum Governorate
  { id: 26, name: "Fayoum Gate", governorate: "Fayoum", branch: "Bahr Youssef", status: "active", lat: 29.31, lng: 30.84, positionOrder: 26, upstream: 6.1, downstream: 5.4, batteryVoltage: 12.9, flowRate: 20.1 },
  { id: 27, name: "Fayoum Central", governorate: "Fayoum", branch: "Bahr Youssef", status: "active", lat: 29.3084, lng: 30.8428, positionOrder: 27, upstream: 6.0, downstream: 5.3, batteryVoltage: 12.8, flowRate: 19.8 },
  { id: 28, name: "Tamiya", governorate: "Fayoum", branch: "Bahr Youssef", status: "alarm", lat: 29.4667, lng: 30.9667, positionOrder: 28, upstream: 5.9, downstream: 5.2, batteryVoltage: 11.9, flowRate: 19.4 },
  
  // Giza Governorate
  { id: 29, name: "Giza North", governorate: "Giza", branch: "Ibrahimiya", status: "active", lat: 30.0131, lng: 31.2089, positionOrder: 29, upstream: 6.2, downstream: 5.5, batteryVoltage: 12.7, flowRate: 20.3 },
  { id: 30, name: "Giza South", governorate: "Giza", branch: "Ibrahimiya", status: "active", lat: 29.9931, lng: 31.1889, positionOrder: 30, upstream: 6.1, downstream: 5.4, batteryVoltage: 12.6, flowRate: 20.0 },
  { id: 31, name: "Hawamdeya", governorate: "Giza", branch: "Ibrahimiya", status: "active", lat: 29.9000, lng: 31.2500, positionOrder: 31, upstream: 6.0, downstream: 5.3, batteryVoltage: 12.5, flowRate: 19.6 },
  
  // Cairo Governorate
  { id: 32, name: "Cairo Intake", governorate: "Cairo", branch: "Ibrahimiya", status: "inactive", lat: 30.04, lng: 31.24, positionOrder: 32, upstream: 6.4, downstream: 5.8, batteryVoltage: 12.1, flowRate: 21.5 },
  { id: 33, name: "Cairo Central", governorate: "Cairo", branch: "Main Canal", status: "active", lat: 30.0444, lng: 31.2357, positionOrder: 33, upstream: 6.3, downstream: 5.7, batteryVoltage: 12.8, flowRate: 21.2 },
  
  // Qalyubia Governorate
  { id: 34, name: "Qalyub", governorate: "Qalyubia", branch: "Main Canal", status: "active", lat: 30.1792, lng: 31.2056, positionOrder: 34, upstream: 6.5, downstream: 5.9, batteryVoltage: 12.9, flowRate: 21.8 },
  { id: 35, name: "Shubra El Kheima", governorate: "Qalyubia", branch: "Main Canal", status: "active", lat: 30.1286, lng: 31.2442, positionOrder: 35, upstream: 6.4, downstream: 5.8, batteryVoltage: 12.8, flowRate: 21.4 },
  
  // Menoufia Governorate
  { id: 36, name: "Shibin El Kom", governorate: "Menoufia", branch: "Rosetta Branch", status: "active", lat: 30.5594, lng: 31.0118, positionOrder: 36, upstream: 6.6, downstream: 6.0, batteryVoltage: 13.0, flowRate: 22.1 },
  { id: 37, name: "Menouf", governorate: "Menoufia", branch: "Rosetta Branch", status: "active", lat: 30.5667, lng: 30.9333, positionOrder: 37, upstream: 6.5, downstream: 5.9, batteryVoltage: 12.9, flowRate: 21.7 },
  
  // Gharbia Governorate
  { id: 38, name: "Tanta", governorate: "Gharbia", branch: "Rosetta Branch", status: "active", lat: 30.7865, lng: 31.0004, positionOrder: 38, upstream: 6.7, downstream: 6.1, batteryVoltage: 13.1, flowRate: 22.4 },
  { id: 39, name: "Mahalla El Kubra", governorate: "Gharbia", branch: "Damietta Branch", status: "active", lat: 30.9700, lng: 31.1667, positionOrder: 39, upstream: 6.6, downstream: 6.0, batteryVoltage: 13.0, flowRate: 22.0 },
  
  // Kafr El Sheikh Governorate (Northernmost)
  { id: 40, name: "Kafr El Sheikh", governorate: "Kafr El Sheikh", branch: "Rosetta Branch", status: "active", lat: 31.1107, lng: 30.9388, positionOrder: 40, upstream: 6.8, downstream: 6.2, batteryVoltage: 13.2, flowRate: 22.7 },
  { id: 41, name: "Rosetta Mouth", governorate: "Kafr El Sheikh", branch: "Rosetta Branch", status: "active", lat: 31.4054, lng: 30.4164, positionOrder: 41, upstream: 7.0, downstream: 6.4, batteryVoltage: 13.3, flowRate: 23.1 },
] as const;

// Transform legacy data to SiteSummary format
export const demoSites: SiteSummary[] = legacySites.map(site => ({
  siteId: site.id.toString(),
  siteName: site.name,
  governorate: site.governorate,
  branch: site.branch,
  status: site.status as SiteStatus,
  coordinates: [site.lat, site.lng] as [number, number],
  position: site.positionOrder,
  upstream: site.upstream,
  downstream: site.downstream,
  batteryVoltage: site.batteryVoltage,
  flowRate: site.flowRate,
  lastReading: now,
}));

// Governorate configurations with branches and site mappings
export const demoGovernorateConfigs: GovernorateConfig[] = [
  {
    name: "Aswan",
    branches: ["Main Canal"],
    siteIds: ["1", "2", "3"],
    coordinates: [24.0084, 32.8998],
  },
  {
    name: "Luxor",
    branches: ["Main Canal"],
    siteIds: ["4", "5"],
    coordinates: [25.6872, 32.6396],
  },
  {
    name: "Qena",
    branches: ["Main Canal"],
    siteIds: ["6", "7", "8"],
    coordinates: [26.1551, 32.7160],
  },
  {
    name: "Sohag",
    branches: ["Main Canal"],
    siteIds: ["9", "10", "11"],
    coordinates: [26.5569, 31.6948],
  },
  {
    name: "Asyut",
    branches: ["Main Canal", "Ibrahimiya"],
    siteIds: ["12", "13", "14"],
    coordinates: [27.1809, 31.1837],
  },
  {
    name: "Minia",
    branches: ["Ibrahimiya", "Bahr Youssef"],
    siteIds: ["15", "16", "17", "18", "19", "20", "21", "22"],
    coordinates: [28.115, 30.75],
  },
  {
    name: "Beni Suef",
    branches: ["Ibrahimiya", "Bahr Youssef"],
    siteIds: ["23", "24", "25"],
    coordinates: [29.07, 31.1],
  },
  {
    name: "Fayoum",
    branches: ["Bahr Youssef"],
    siteIds: ["26", "27", "28"],
    coordinates: [29.31, 30.84],
  },
  {
    name: "Giza",
    branches: ["Ibrahimiya"],
    siteIds: ["29", "30", "31"],
    coordinates: [30.0131, 31.2089],
  },
  {
    name: "Cairo",
    branches: ["Ibrahimiya", "Main Canal"],
    siteIds: ["32", "33"],
    coordinates: [30.04, 31.24],
  },
  {
    name: "Qalyubia",
    branches: ["Main Canal"],
    siteIds: ["34", "35"],
    coordinates: [30.1792, 31.2056],
  },
  {
    name: "Menoufia",
    branches: ["Rosetta Branch"],
    siteIds: ["36", "37"],
    coordinates: [30.5594, 31.0118],
  },
  {
    name: "Gharbia",
    branches: ["Rosetta Branch", "Damietta Branch"],
    siteIds: ["38", "39"],
    coordinates: [30.7865, 31.0004],
  },
  {
    name: "Kafr El Sheikh",
    branches: ["Rosetta Branch"],
    siteIds: ["40", "41"],
    coordinates: [31.1107, 30.9388],
  },
];

// Demo users with different access levels
export const demoUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@ups.local",
    fullName: "System Administrator",
    roles: ["admin", "master"],
    accessibleSites: demoSites.map(site => site.siteId),
  },
  {
    id: "2",
    username: "minia.viewer",
    email: "minia.viewer@ups.local",
    fullName: "Minia Governorate Viewer",
    roles: ["governorate_viewer"],
    accessibleSites: ["15", "16", "17", "18", "19", "20", "21"],
    governorate: "Minia",
  },
  {
    id: "3",
    username: "cairo.viewer",
    email: "cairo.viewer@ups.local",
    fullName: "Cairo Governorate Viewer",
    roles: ["governorate_viewer"],
    accessibleSites: ["31", "32"],
    governorate: "Cairo",
  },
  {
    id: "4",
    username: "ops.lead",
    email: "ops.lead@ups.local",
    fullName: "Operations Lead",
    roles: ["operations", "multi_governorate"],
    accessibleSites: ["15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32"],
  },
  {
    id: "5",
    username: "site.tech",
    email: "site.tech@ups.local",
    fullName: "Site Technician",
    roles: ["site_viewer"],
    accessibleSites: ["15", "16", "17"],
  },
  {
    id: "6",
    username: "director",
    email: "director@ups.local",
    fullName: "System Director",
    roles: ["admin", "master", "director"],
    accessibleSites: demoSites.map(site => site.siteId),
  },
];

export const demoKpis: SystemKPIs = {
  totalSites: 41,
  activeSites: 37,
  inactiveSites: 3,
  urgentAlarms: 4,
  lastUpdated: new Date(),
};

// Comprehensive event logs with realistic alarm and maintenance records
export const demoEvents: Event[] = [
  // Critical alarms
  {
    id: "evt_1001",
    siteId: "17", // Abu Qurqas
    timestamp: new Date("2026-02-04T14:30:00Z"),
    type: "alarm",
    severity: "critical",
    message: "Battery voltage critically low - immediate attention required",
    acknowledged: false,
  },
  {
    id: "evt_1002",
    siteId: "27", // Tamiya
    timestamp: new Date("2026-02-04T13:15:00Z"),
    type: "alarm",
    severity: "critical",
    message: "Communication failure - site offline",
    acknowledged: false,
  },
  {
    id: "evt_1003",
    siteId: "31", // Cairo Intake
    timestamp: new Date("2026-02-04T12:45:00Z"),
    type: "alarm",
    severity: "high",
    message: "Upstream level below threshold",
    acknowledged: true,
    acknowledgedBy: "ops.lead@ups.local",
    acknowledgedAt: new Date("2026-02-04T13:00:00Z"),
  },
  {
    id: "evt_1004",
    siteId: "11", // Akhmim
    timestamp: new Date("2026-02-04T11:20:00Z"),
    type: "alarm",
    severity: "high",
    message: "Flow rate anomaly detected",
    acknowledged: false,
  },
  
  // Warning events
  {
    id: "evt_2001",
    siteId: "16", // Minia South
    timestamp: new Date("2026-02-04T10:30:00Z"),
    type: "warning",
    severity: "medium",
    message: "Downstream level trending downward",
    acknowledged: true,
    acknowledgedBy: "minia.viewer@ups.local",
    acknowledgedAt: new Date("2026-02-04T11:00:00Z"),
  },
  {
    id: "evt_2002",
    siteId: "5", // Luxor West
    timestamp: new Date("2026-02-04T09:15:00Z"),
    type: "warning",
    severity: "medium",
    message: "Battery charging cycle irregular",
    acknowledged: false,
  },
  {
    id: "evt_2003",
    siteId: "23", // Beni Suef West
    timestamp: new Date("2026-02-04T08:45:00Z"),
    type: "warning",
    severity: "low",
    message: "Minor flow rate fluctuation",
    acknowledged: true,
    acknowledgedBy: "ops.lead@ups.local",
    acknowledgedAt: new Date("2026-02-04T09:00:00Z"),
  },
  
  // Maintenance events
  {
    id: "evt_3001",
    siteId: "5", // Luxor West
    timestamp: new Date("2026-02-04T07:00:00Z"),
    type: "maintenance",
    severity: "info",
    message: "Scheduled maintenance started - sensor calibration",
    acknowledged: true,
    acknowledgedBy: "site.tech@ups.local",
    acknowledgedAt: new Date("2026-02-04T07:05:00Z"),
  },
  {
    id: "evt_3002",
    siteId: "12", // Asyut Barrage
    timestamp: new Date("2026-02-03T16:30:00Z"),
    type: "maintenance",
    severity: "info",
    message: "Preventive maintenance completed - all systems normal",
    acknowledged: true,
    acknowledgedBy: "ops.lead@ups.local",
    acknowledgedAt: new Date("2026-02-03T16:35:00Z"),
  },
  {
    id: "evt_3003",
    siteId: "25", // Fayoum Gate
    timestamp: new Date("2026-02-03T14:00:00Z"),
    type: "maintenance",
    severity: "info",
    message: "Battery replacement scheduled for next week",
    acknowledged: true,
    acknowledgedBy: "ops.lead@ups.local",
    acknowledgedAt: new Date("2026-02-03T14:15:00Z"),
  },
  
  // System events
  {
    id: "evt_4001",
    siteId: "20", // Maghagha
    timestamp: new Date("2026-02-04T06:00:00Z"),
    type: "system",
    severity: "info",
    message: "Daily data backup completed successfully",
    acknowledged: true,
    acknowledgedBy: "admin@ups.local",
    acknowledgedAt: new Date("2026-02-04T06:05:00Z"),
  },
  {
    id: "evt_4002",
    siteId: "37", // Tanta
    timestamp: new Date("2026-02-04T05:30:00Z"),
    type: "system",
    severity: "info",
    message: "Communication restored after network maintenance",
    acknowledged: true,
    acknowledgedBy: "admin@ups.local",
    acknowledgedAt: new Date("2026-02-04T05:35:00Z"),
  },
  
  // Info events
  {
    id: "evt_5001",
    siteId: "39", // Kafr El Sheikh
    timestamp: new Date("2026-02-04T04:15:00Z"),
    type: "info",
    severity: "info",
    message: "Flow rate stabilized within normal range",
    acknowledged: true,
    acknowledgedBy: "ops.lead@ups.local",
    acknowledgedAt: new Date("2026-02-04T04:20:00Z"),
  },
  {
    id: "evt_5002",
    siteId: "1", // Aswan High Dam
    timestamp: new Date("2026-02-04T03:00:00Z"),
    type: "info",
    severity: "info",
    message: "Upstream level optimal for current season",
    acknowledged: true,
    acknowledgedBy: "admin@ups.local",
    acknowledgedAt: new Date("2026-02-04T03:05:00Z"),
  },
];

// Legacy alarm events for backward compatibility
export const demoAlarmEvents: AlarmEvent[] = [
  {
    id: 1001,
    siteId: 17, // Abu Qurqas
    siteName: "Abu Qurqas",
    severity: "critical",
    field: "Battery Voltage",
    message: "Battery below threshold",
    timestamp: now.toISOString(),
    actualValue: 11.8,
    thresholdValue: 12.2,
  },
  {
    id: 1002,
    siteId: 16, // Minia South
    siteName: "Minia South",
    severity: "medium",
    field: "Downstream",
    message: "Downstream below expected range",
    timestamp: now.toISOString(),
  },
  {
    id: 1003,
    siteId: 20, // Maghagha
    siteName: "Maghagha",
    severity: "info",
    field: "Flow Rate",
    message: "Flow stabilized",
    timestamp: now.toISOString(),
  },
  {
    id: 1004,
    siteId: 27, // Tamiya
    siteName: "Tamiya",
    severity: "critical",
    field: "Communication",
    message: "Site communication lost",
    timestamp: now.toISOString(),
  },
];

// Generate comprehensive time series data for all sites
export const generateSiteReadings = (siteId: string, timeRange: { start: Date; end: Date; interval: 'hourly' | 'daily' }): SiteReading[] => {
  const site = demoSites.find(s => s.siteId === siteId);
  if (!site) return [];
  
  const { start, end, interval } = timeRange;
  const stepMinutes = interval === 'hourly' ? 60 : 1440; // 60 min or 24 hours
  const points = Math.floor((end.getTime() - start.getTime()) / (stepMinutes * 60 * 1000));
  
  return Array.from({ length: points }, (_, index) => {
    const timestamp = new Date(start.getTime() + index * stepMinutes * 60 * 1000);
    const hours = index * (stepMinutes / 60);
    
    // Generate realistic patterns based on site characteristics
    const baseUpstream = site.upstream;
    const baseDownstream = site.downstream;
    const baseBattery = site.batteryVoltage;
    const baseFlow = site.flowRate;
    
    // Add realistic variations
    const upstreamVariation = Math.sin(hours / 12) * 0.2 + (Math.random() - 0.5) * 0.1;
    const downstreamVariation = upstreamVariation * 0.85 + (Math.random() - 0.5) * 0.08;
    const batteryLevel = generateBatteryPattern(baseBattery, hours);
    const flowVariation = Math.cos(hours / 8) * 0.4 + (Math.random() - 0.5) * 0.2;
    
    // Determine status based on values
    let status: ReadingStatus = 'normal';
    if (batteryLevel < 12.0 || Math.abs(upstreamVariation) > 0.25) {
      status = 'alarm';
    } else if (batteryLevel < 12.3 || Math.abs(upstreamVariation) > 0.15) {
      status = 'warning';
    }
    
    return {
      timestamp,
      upstream: round(baseUpstream + upstreamVariation, 2),
      downstream: round(baseDownstream + downstreamVariation, 2),
      batteryVoltage: batteryLevel,
      flowRate: round(Math.max(0, baseFlow + flowVariation), 2),
      status,
    };
  });
};

// Complete demo dataset
export const demoDataSet: DemoDataSet = {
  sites: demoSites.map(site => ({
    id: site.siteId,
    name: site.siteName,
    coordinates: site.coordinates,
    status: site.status,
    governorate: site.governorate,
    branch: site.branch,
    position: site.position,
  })),
  users: demoUsers,
  readings: new Map(
    demoSites.map(site => [
      site.siteId,
      generateSiteReadings(site.siteId, {
        start: new Date("2026-01-01T00:00:00Z"),
        end: new Date("2026-02-05T00:00:00Z"),
        interval: 'hourly'
      })
    ])
  ),
  events: demoEvents,
  governorates: demoGovernorateConfigs,
};

export const demoLandingOverview: LandingOverview = {
  kpis: demoKpis,
  sites: demoSites,
  recentEvents: demoEvents.slice(0, 10), // Show recent events
};

export const buildDemoSiteDetails = (siteId: number): SiteDetails => {
  const site = demoSites.find((item) => item.siteId === siteId.toString()) ?? demoSites[0];
  
  // Generate 24 hours of hourly data
  const hourly: TimeSeriesPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const hours = i;
    
    // Simple sine wave patterns
    const upstreamBase = site.upstream;
    const downstreamBase = site.downstream;
    const batteryBase = site.batteryVoltage;
    const flowBase = site.flowRate;
    
    const upstreamVariation = Math.sin(hours / 6) * 0.2;
    const downstreamVariation = upstreamVariation * 0.8;
    const batteryVariation = Math.sin(hours / 12) * 0.3;
    const flowVariation = Math.cos(hours / 8) * 0.5;
    
    hourly.push({
      timestamp: timestamp.toISOString(),
      upstream: round(upstreamBase + upstreamVariation, 2),
      downstream: round(downstreamBase + downstreamVariation, 2),
      batteryVoltage: round(batteryBase + batteryVariation, 2),
      flowRate: round(Math.max(0, flowBase + flowVariation), 2),
    });
  }
  
  // Generate 14 days of daily data
  const daily: TimeSeriesPoint[] = [];
  for (let i = 0; i < 14; i++) {
    const timestamp = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
    
    daily.push({
      timestamp: timestamp.toISOString(),
      upstream: round(site.upstream + (Math.random() - 0.5) * 0.2, 2),
      downstream: round(site.downstream + (Math.random() - 0.5) * 0.2, 2),
      batteryVoltage: round(site.batteryVoltage + (Math.random() - 0.5) * 0.4, 2),
      flowRate: round(Math.max(0, site.flowRate + (Math.random() - 0.5) * 2), 2),
    });
  }
  
  // Get site-specific events
  const siteEvents = demoEvents.filter((event) => event.siteId === site.siteId);
  
  return {
    site,
    series: hourly,
    hourlyReadings: hourly,
    dailyReadings: daily,
    events: siteEvents,
  };
};

export const buildDemoGovernorateOverview = (governorateName: string): GovernorateOverview => {
  const sites = demoSites.filter((site) => site.governorate.toLowerCase() === governorateName.toLowerCase());
  const branches = Array.from(new Set(sites.map((site) => site.branch))).map((branch) => ({
    name: branch,
    sites: sites.filter((site) => site.branch === branch).sort((a, b) => a.position - b.position),
  }));
  
  return {
    governorateName,
    branches,
  };
};

export const demoMasterOverview = {
  sites: demoSites.sort((a, b) => a.position - b.position),
};

export const demoScheduledReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Daily Minia Summary",
    sites: ["15", "16", "17", "18", "19", "20", "21"], // Minia sites
    timeRange: { type: 'latest' },
    frequency: "daily",
    recipients: ["minia.viewer@ups.local"],
    format: "pdf",
    isActive: true,
    nextRun: new Date("2026-02-05T11:00:00Z"),
  },
  {
    id: "2",
    name: "Weekly Master Overview",
    sites: demoSites.map((site) => site.siteId),
    timeRange: { type: 'week' },
    frequency: "weekly",
    recipients: ["ops.lead@ups.local", "director@ups.local"],
    format: "excel",
    isActive: true,
    nextRun: new Date("2026-02-09T08:30:00Z"),
  },
  {
    id: "3",
    name: "Monthly Governorate Report",
    sites: ["31", "32"], // Cairo sites
    timeRange: { type: 'month' },
    frequency: "monthly",
    recipients: ["cairo.viewer@ups.local", "ops.lead@ups.local"],
    format: "pdf",
    isActive: true,
    nextRun: new Date("2026-03-01T09:00:00Z"),
  },
];

// Utility functions for data access
export const getSiteById = (siteId: string | number): SiteSummary | undefined => {
  return demoSites.find(site => site.siteId === siteId.toString());
};

export const getSitesByGovernorate = (governorate: string): SiteSummary[] => {
  return demoSites.filter(site => 
    site.governorate.toLowerCase() === governorate.toLowerCase()
  ).sort((a, b) => a.position - b.position);
};

export const getSitesByBranch = (branch: string): SiteSummary[] => {
  return demoSites.filter(site => 
    site.branch.toLowerCase() === branch.toLowerCase()
  ).sort((a, b) => a.position - b.position);
};

export const getEventsBySite = (siteId: string): Event[] => {
  return demoEvents.filter(event => event.siteId === siteId);
};

export const getActiveAlarms = (): Event[] => {
  return demoEvents.filter(event => 
    event.type === 'alarm' && 
    (event.severity === 'critical' || event.severity === 'high') &&
    !event.acknowledged
  );
};

export const calculateSystemKPIs = (accessibleSiteIds?: string[]): SystemKPIs => {
  const sites = accessibleSiteIds 
    ? demoSites.filter(site => accessibleSiteIds.includes(site.siteId))
    : demoSites;
    
  const activeSites = sites.filter(site => site.status === 'active').length;
  const inactiveSites = sites.filter(site => site.status === 'inactive').length;
  const urgentAlarms = getActiveAlarms().filter(alarm => 
    accessibleSiteIds ? accessibleSiteIds.includes(alarm.siteId) : true
  ).length;
  
  return {
    totalSites: sites.length,
    activeSites,
    inactiveSites,
    urgentAlarms,
    lastUpdated: now,
  };
};
