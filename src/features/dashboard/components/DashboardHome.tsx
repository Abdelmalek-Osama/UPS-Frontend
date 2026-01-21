import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  Droplets,
  Power,
  Battery,
  WifiOff,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flowData, directorateData, recentAlarmEvents, readingLogs, stats } = useDashboardData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
 const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return time;
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { label: string; className: string }> = {
      critical: { label: t('alarms.critical'), className: 'bg-red-100 text-red-700' },
      warning: { label: t('alarms.warning'), className: 'bg-yellow-100 text-yellow-700' },
      info: { label: t('alarms.info'), className: 'bg-blue-100 text-blue-700' },
    };
    const config = severityMap[severity.toLowerCase()] || severityMap['info'];
    return (
    <Badge className={`${config.className} border-0`}>
        {config.label}
    </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl">{t('dashboard.title')}</h2>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

 {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm">{t('dashboard.totalSites')}</CardTitle>
    <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
      <CardContent>
       <div className="text-2xl">{stats.totalSites}</div>
      <p className="text-xs text-gray-500 mt-1">
           <span className="text-green-600">{t('dashboard.allConnected')}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
   <CardTitle className="text-sm">{t('dashboard.activeAlarms')}</CardTitle>
       <AlertTriangle className="h-4 w-4 text-yellow-600" />
       </CardHeader>
          <CardContent>
       <div className="text-2xl">{stats.activeAlarms}</div>
      <p className="text-xs text-gray-500 mt-1">
     <span className="text-red-600">{stats.criticalAlarms} {t('dashboard.critical')}</span> • <span className="text-yellow-600">{stats.warningAlarms} {t('dashboard.warnings')}</span>
       </p>
      </CardContent>
        </Card>

    <Card>
     <CardHeader className="flex flex-row items-center justify-between pb-2">
   <CardTitle className="text-sm">{t('dashboard.totalFlow')}</CardTitle>
       <TrendingUp className="h-4 w-4 text-green-600" />
     </CardHeader>
  <CardContent>
   <div className="text-2xl">{stats.totalFlow.toLocaleString()} {t('dashboard.flowPerHour')}</div>
      <p className="text-xs text-green-600 mt-1">
    ↑ {stats.flowChange}% {t('dashboard.flowChange')}
            </p>
          </CardContent>
    </Card>

  <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{t('dashboard.activeStations')}</CardTitle>
  <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
    <CardContent>
   <div className="text-2xl">{stats.activeStations}/{stats.totalStations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {t('dashboard.uptimePercentage')}: {stats.uptimePercentage}%
            </p>
          </CardContent>
    </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.flowInLast24Hours')}</CardTitle>
          </CardHeader>
 <CardContent>
            <ResponsiveContainer width="100%" height={250}>
     <LineChart data={flowData} margin={{ top: 5, bottom: 5 }}>
           <CartesianGrid strokeDasharray="3 3" />
       <XAxis dataKey="time" />
    <YAxis 
           label={{ value: t('dashboard.flowPerHour'), angle: -90, position: 'insideLeft', dy:-20 }} 
       tick={{dx: -25}}
           />
           <Tooltip />
    <Legend />
       <Line type="monotone" dataKey="flow" stroke="#2563eb" name={t('readings.totalFlow')} strokeWidth={2} />
       </LineChart>
      </ResponsiveContainer>
     </CardContent>
        </Card>

 <Card>
     <CardHeader>
            <CardTitle>{t('dashboard.sitesByDirectorate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
          <BarChart data={directorateData} margin={{ top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
   <XAxis dataKey="name" />
    <YAxis 
              label={{value: t('sites.sitesCount'), angle: -90, position: 'insideLeft', dy:-20 }} 
      tick={{dx: -15}}
             />
                <Tooltip />
      <Legend />
    <Bar dataKey="sites" fill="#3b82f6" name={t('dashboard.totalSites')} />
       <Bar dataKey="active" fill="#10b981" name={t('common.active')} />
   </BarChart>
       </ResponsiveContainer>
       </CardContent>
        </Card>
 </div>

      {/* Recent Alarm Events and Recent Reading Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alarm Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
   <CardTitle>{t('dashboard.recentAlarmEvents')}</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/alarms/events')}>
              {t('dashboard.viewAll')}
  </Button>
    </CardHeader>
          <CardContent>
    {recentAlarmEvents.length === 0 ? (
     <div className="text-center py-8 text-gray-500">
 <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
     <p>{t('dashboard.noRecentEvents')}</p>
           </div>
            ) : (
    <div className="space-y-3">
                {recentAlarmEvents.map((alarm) => (
         <div key={alarm.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition">
     <div className={`p-2 rounded-lg flex-shrink-0 ${
   alarm.severity === 'critical' ? 'bg-red-100' : alarm.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
  <AlertTriangle className={`h-4 w-4 ${
      alarm.severity === 'critical' ? 'text-red-700' : alarm.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
    }`} />
           </div>
     <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium truncate">{alarm.siteName}</p>
         {getSeverityBadge(alarm.severity)}
               </div>
            <p className="text-xs text-gray-600 mt-1">{alarm.alarmName}</p>
        <p className="text-xs text-gray-500 mt-1">{formatDate(alarm.triggeredAt)}</p>
             </div>
</div>
           ))}
              </div>
    )}
          </CardContent>
        </Card>

      {/* Recent Reading Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
   <CardTitle>{t('dashboard.recentReadingLogs')}</CardTitle>
   <Button variant="outline" size="sm" onClick={() => navigate('/reading-logs')}>
            {t('dashboard.viewAll')}
     </Button>
          </CardHeader>
       <CardContent>
  {readingLogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
         <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
   <p>{t('dashboard.noRecentReadings')}</p>
              </div>
       ) : (
         <div className="space-y-3">
  {readingLogs.map((reading, index) => (
   <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition">
       <div className={`p-2 rounded-lg flex-shrink-0 ${
  reading.type === 'WaterLevel' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
     {reading.type === 'WaterLevel' ? (
          <Droplets className="h-4 w-4 text-blue-700" />
          ) : (
      <Power className="h-4 w-4 text-green-700" />
           )}
       </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{reading.site}</p>
               <div className="text-xs text-gray-600 mt-1 space-y-0.5">
   {reading.type === 'WaterLevel' ? (
            <>
          <p>{t('readings.uswl')}: {reading.uswl?.toFixed(2)} م • {t('readings.dswl')}: {reading.dswl?.toFixed(2)} م</p>
 <p>{t('readings.calculatedFlow')}: {reading.calculatedFlow?.toFixed(2)} {t('dashboard.flowPerHour')}</p>
    </>
          ) : (
       <>
  <p>{t('readings.totalFlow')}: {reading.totalFlow?.toFixed(2)} {t('dashboard.flowPerHour')}</p>
           <p>{t('readings.uptime')}: {reading.uptime?.toFixed(2)} {t('common.time')}</p>
               </>
        )}
       </div>
          <p className="text-xs text-gray-400 mt-1">{formatDate(reading.timestamp)}</p>
   </div>
           </div>
   ))}
  </div>
       )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
