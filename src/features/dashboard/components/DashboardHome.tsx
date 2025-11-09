import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
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
  WifiOff
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardHome() {
  const { flowData, directorateData, activeAlarms, recentReadings, stats } = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl">لوحة التحكم الرئيسية</h2>
        <p className="text-gray-500 mt-1">نظرة عامة على شبكة الري الوطنية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">إجمالي المواقع</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalSites}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600">جميع المواقع متصلة</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">التنبيهات النشطة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeAlarms}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-red-600">{stats.criticalAlarms} حرجة</span> • <span className="text-yellow-600">{stats.warningAlarms} تحذيرات</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">إجمالي التدفق</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalFlow.toLocaleString()} م³/س</div>
            <p className="text-xs text-green-600 mt-1">
              ↑ {stats.flowChange}% عن الساعة السابقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">المحطات النشطة</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeStations}/{stats.totalStations}</div>
            <p className="text-xs text-gray-500 mt-1">
              معدل التشغيل: {stats.uptimePercentage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <Card>
          <CardHeader>
            <CardTitle>التدفق خلال 24 ساعة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={flowData} margin={{ top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  label={{ value: 'م³/س', angle: -90, position: 'insideLeft', dy:-20 }} 
                  tick={{dx: -25}}
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="flow" stroke="#2563eb" name="التدفق" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المواقع حسب المديرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={directorateData} margin={{ top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  label={{value: 'عدد المواقع', angle: -90, position: 'insideLeft', dy:-20 }} 
                  tick={{dx: -15}}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="sites" fill="#3b82f6" name="إجمالي المواقع" />
                <Bar dataKey="active" fill="#10b981" name="النشطة" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alarms and Recent Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alarms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>التنبيهات النشطة</CardTitle>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlarms.map((alarm) => (
                <div key={alarm.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    alarm.severity === 'Critical' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {alarm.type === 'battery' && <Battery className="h-4 w-4 text-yellow-700" />}
                    {alarm.type === 'communication' && <WifiOff className="h-4 w-4 text-red-700" />}
                    {alarm.type === 'flow' && <Droplets className="h-4 w-4 text-yellow-700" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="text-sm">{alarm.site}</p>
                      <Badge variant={alarm.severity === 'Critical' ? 'destructive' : 'outline'}>
                        {alarm.severity === 'Critical' ? 'حرج' : 'تحذير'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alarm.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{alarm.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Readings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>القراءات الأخيرة</CardTitle>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReadings.map((reading, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    reading.type === 'WaterLevel' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {reading.type === 'WaterLevel' ? (
                      <Droplets className="h-4 w-4 text-blue-700" />
                    ) : (
                      <Power className="h-4 w-4 text-green-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{reading.site}</p>
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {reading.type === 'WaterLevel' ? (
                        <>
                          <p>USWL: {reading.uswl} م • DSWL: {reading.dswl} م</p>
                          <p>التدفق المحسوب: {reading.flow} م³/س</p>
                        </>
                      ) : (
                        <>
                          <p>إجمالي التدفق: {reading.totalFlow} م³/س</p>
                          <p>وقت التشغيل: {reading.uptime} ساعة</p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{reading.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
