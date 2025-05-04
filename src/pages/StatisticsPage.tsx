
import React, { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getMonth, getYear } from "date-fns";
import { getApplications, getApplicationStats } from "@/lib/storage";
import { JobApplication, ApplicationStats } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const statusColors = {
  applied: "#8b5cf6",
  interviewing: "#3b82f6",
  offer: "#10b981",
  rejected: "#ef4444",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const StatisticsPage = () => {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allApplications = getApplications();
    setApplications(allApplications);

    const appStats = getApplicationStats();
    setStats(appStats);

    // Get available years from applications
    const years = Array.from(
      new Set(
        allApplications.map((app) =>
          new Date(app.dateApplied).getFullYear()
        )
      )
    );
    
    // If no applications yet, add current year
    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }
    
    setAvailableYears(years.sort((a, b) => b - a)); // Sort years descending
  };

  // Prepare chart data for monthly applications
  const getMonthlyData = () => {
    const monthlyCounts = Array(12).fill(0);

    applications.forEach((app) => {
      const date = new Date(app.dateApplied);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (year === selectedYear) {
        monthlyCounts[month]++;
      }
    });

    return monthNames.map((month, index) => ({
      name: month,
      applications: monthlyCounts[index],
    }));
  };

  // Prepare chart data for status distribution
  const getStatusData = () => {
    if (!stats) return [];

    return [
      { name: "Applied", value: stats.statusCounts.applied, color: statusColors.applied },
      { name: "Interviewing", value: stats.statusCounts.interviewing, color: statusColors.interviewing },
      { name: "Offer", value: stats.statusCounts.offer, color: statusColors.offer },
      { name: "Rejected", value: stats.statusCounts.rejected, color: statusColors.rejected },
    ];
  };

  // Prepare chart data for daily applications in the current month
  const getDailyData = () => {
    const currentDate = new Date();
    const monthToShow = selectedYear === currentDate.getFullYear() 
      ? currentDate.getMonth() 
      : 11; // If not current year, show December
    
    const firstDayOfMonth = startOfMonth(new Date(selectedYear, monthToShow));
    const lastDayOfMonth = endOfMonth(new Date(selectedYear, monthToShow));
    
    const daysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });
    
    const dailyCounts = daysInMonth.map((day) => {
      const count = applications.filter((app) => {
        const appDate = new Date(app.dateApplied);
        return (
          appDate.getDate() === day.getDate() &&
          appDate.getMonth() === day.getMonth() &&
          appDate.getFullYear() === day.getFullYear()
        );
      }).length;
      
      return {
        day: format(day, "d"),
        applications: count,
      };
    });
    
    return {
      data: dailyCounts,
      monthName: format(firstDayOfMonth, "MMMM yyyy"),
    };
  };

  // Prepare chart data for response time
  const getResponseTimeData = () => {
    const appsByMonth = Array(12).fill(0).map(() => ({
      applied: 0,
      responded: 0, // interviews + offers + rejections
      averageResponseDays: 0,
    }));
    
    applications.forEach((app) => {
      const appDate = new Date(app.dateApplied);
      const appMonth = appDate.getMonth();
      const appYear = appDate.getFullYear();
      
      if (appYear === selectedYear) {
        appsByMonth[appMonth].applied++;
        
        if (app.status !== "applied") {
          appsByMonth[appMonth].responded++;
          
          // Calculate response time
          const appliedDate = new Date(app.dateApplied).getTime();
          const updatedDate = new Date(app.dateUpdated).getTime();
          const daysDiff = (updatedDate - appliedDate) / (1000 * 60 * 60 * 24);
          
          // Update average
          const currentTotal = appsByMonth[appMonth].averageResponseDays * (appsByMonth[appMonth].responded - 1);
          appsByMonth[appMonth].averageResponseDays = (currentTotal + daysDiff) / appsByMonth[appMonth].responded;
        }
      }
    });
    
    return monthNames.map((month, index) => ({
      name: month,
      responseRate: appsByMonth[index].applied > 0 
        ? (appsByMonth[index].responded / appsByMonth[index].applied) * 100 
        : 0,
      averageDays: appsByMonth[index].averageResponseDays,
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          Analyze your job application data
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="font-medium">
          Showing data for year:
        </p>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-md px-3 py-1 bg-background"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Stats</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="response">Response Analysis</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                <p className="text-xs text-muted-foreground">
                  In {selectedYear}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats
                    ? `${Math.round(stats.responseRate)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applications with any response
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.averageDaysToResponse > 0
                    ? `${Math.round(stats.averageDaysToResponse)} days`
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to first response
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.totalApplications
                    ? `${Math.round((stats.statusCounts.offer / stats.totalApplications) * 100) || 0}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Applications resulting in offers
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of application statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                      }
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Monthly Applications in {selectedYear}</CardTitle>
                <CardDescription>
                  Number of job applications by month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{fontSize: 12}}
                      tickFormatter={(value) => value.substring(0, 3)}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Monthly Stats Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Month in {selectedYear}</CardTitle>
              <CardDescription>
                Monthly breakdown of your job applications
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Daily Applications in {getDailyData().monthName}</CardTitle>
              <CardDescription>
                Daily breakdown for the most recent month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDailyData().data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Status Breakdown Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Applied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusCounts.applied || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalApplications 
                    ? `${Math.round((stats.statusCounts.applied / stats.totalApplications) * 100)}% of total`
                    : "No applications"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Interviewing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusCounts.interviewing || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalApplications 
                    ? `${Math.round((stats.statusCounts.interviewing / stats.totalApplications) * 100)}% of total`
                    : "No applications"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusCounts.offer || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalApplications 
                    ? `${Math.round((stats.statusCounts.offer / stats.totalApplications) * 100)}% of total`
                    : "No applications"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.statusCounts.rejected || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalApplications 
                    ? `${Math.round((stats.statusCounts.rejected / stats.totalApplications) * 100)}% of total`
                    : "No applications"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>
                Visual breakdown of your application statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ""
                    }
                  >
                    {getStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} applications`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Response Analysis Tab */}
        <TabsContent value="response" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Rate by Month</CardTitle>
              <CardDescription>
                Percentage of applications that received any response
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getResponseTimeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => value.substring(0, 3)}
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Avg. Days', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip formatter={(value, name) => {
                    if (name === "responseRate") return [`${value.toFixed(1)}%`, "Response Rate"];
                    if (name === "averageDays") return [`${value.toFixed(1)} days`, "Avg. Response Time"];
                    return [value, name];
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="responseRate" 
                    name="Response Rate" 
                    stroke="#8b5cf6" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="averageDays" 
                    name="Avg. Response Time" 
                    stroke="#10b981" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Analysis</CardTitle>
              <CardDescription>
                Key metrics about application responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Response Time</p>
                  <p className="text-2xl font-bold">
                    {stats && stats.averageDaysToResponse > 0
                      ? `${stats.averageDaysToResponse.toFixed(1)} days`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">From application to first response</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">
                    {stats ? `${stats.responseRate.toFixed(1)}%` : "0%"}
                  </p>
                  <p className="text-xs text-muted-foreground">Applications with any response</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interview-to-Offer Ratio</p>
                  <p className="text-2xl font-bold">
                    {stats && stats.statusCounts.interviewing > 0
                      ? `${((stats.statusCounts.offer / stats.statusCounts.interviewing) * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Interviews that converted to offers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
