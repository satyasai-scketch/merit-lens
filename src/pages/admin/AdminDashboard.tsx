import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, FunnelChart, Funnel, Cell } from 'recharts';
import { Users, Clock, CheckCircle, TrendingUp, UserCheck, UserX, Timer, Target } from 'lucide-react';
import { loadDashboard } from '@/lib/data';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard()
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load dashboard:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard data</div>;
  }

  const kpiCards = [
    {
      title: 'Invited',
      value: dashboardData.kpis.invited,
      icon: Users,
      description: 'Total candidates invited',
      color: 'text-blue-600'
    },
    {
      title: 'Started',
      value: dashboardData.kpis.started,
      icon: UserCheck,
      description: 'Candidates who began assessments',
      color: 'text-orange-600'
    },
    {
      title: 'Completed',
      value: dashboardData.kpis.completed,
      icon: CheckCircle,
      description: 'Fully completed assessments',
      color: 'text-green-600'
    },
    {
      title: 'Avg. Duration',
      value: `${dashboardData.kpis.avgMinutes}m`,
      icon: Timer,
      description: 'Average completion time',
      color: 'text-purple-600'
    }
  ];

  const bucketColors = {
    Admit: '#10b981',
    Counselling: '#f59e0b', 
    Bridge: '#3b82f6',
    Reject: '#ef4444'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of candidate assessment progress and outcomes
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Funnel</CardTitle>
            <CardDescription>Candidate progression through assessment stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.funnel} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Completions</CardTitle>
            <CardDescription>Assessment completions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bucket Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Recommendations</CardTitle>
            <CardDescription>Distribution of final assessment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dashboardData.buckets).map(([bucket, count]: [string, any]) => {
                const percentage = (count / dashboardData.kpis.completed) * 100;
                return (
                  <div key={bucket} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bucketColors[bucket as keyof typeof bucketColors] }}
                        />
                        <span className="font-medium">{bucket}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: bucketColors[bucket as keyof typeof bucketColors]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Range of composite scores achieved</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dashboardData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}