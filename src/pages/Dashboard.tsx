
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, Briefcase, CalendarClock, Clock, Plus, Sparkles } from "lucide-react";
import { getApplicationStats, getApplications, getReminders } from "@/lib/storage";
import { ApplicationStats, JobApplication, Reminder } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, BarChart, Bar, Tooltip } from "recharts";
import { format, isAfter, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { Link } from "react-router-dom";

const statusColors = {
  applied: "#8b5cf6",
  interviewing: "#3b82f6",
  offer: "#10b981",
  rejected: "#ef4444"
};

const Dashboard = () => {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const loadDashboardData = () => {
      // Get stats
      const appStats = getApplicationStats();
      setStats(appStats);

      // Get recent applications
      const allApplications = getApplications();
      const sorted = [...allApplications].sort(
        (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      );
      setRecentApplications(sorted.slice(0, 5));

      // Get upcoming reminders
      const allReminders = getReminders();
      const today = startOfDay(new Date());
      const upcoming = allReminders
        .filter(reminder => !reminder.isDone && 
                            isAfter(parseISO(reminder.date), today) || 
                            isToday(parseISO(reminder.date)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setUpcomingReminders(upcoming.slice(0, 3));
    };

    loadDashboardData();
  }, []);

  // Prepare chart data for pie chart
  const pieChartData = stats ? [
    { name: "Applied", value: stats.statusCounts.applied, color: statusColors.applied },
    { name: "Interviewing", value: stats.statusCounts.interviewing, color: statusColors.interviewing },
    { name: "Offer", value: stats.statusCounts.offer, color: statusColors.offer },
    { name: "Rejected", value: stats.statusCounts.rejected, color: statusColors.rejected }
  ] : [];

  // Prepare bar chart data (last 7 days)
  const last7DaysData = React.useMemo(() => {
    if (!stats) return [];
    
    const result = [];
    let date = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: format(d, "MMM dd"),
        count: stats.applicationsByDate[dateStr] || 0
      });
    }
    
    return result;
  }, [stats]);

  const getStatusBadge = (status: JobApplication['status']) => {
    const variants: Record<JobApplication['status'], "outline" | "default" | "destructive" | "secondary"> = {
      applied: "outline",
      interviewing: "secondary",
      offer: "default",
      rejected: "destructive"
    };
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <Link to="/applications/new">
          <Button className="flex gap-2">
            <Plus size={18} />
            New Application
          </Button>
        </Link>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats && stats.totalApplications > 0 
                ? `${stats.statusCounts.applied} still awaiting response` 
                : "No applications yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? `${Math.round(stats.responseRate)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalApplications 
                ? `From ${stats.totalApplications} total applications` 
                : "No applications yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.averageDaysToResponse > 0 
                ? `${Math.round(stats.averageDaysToResponse)} days` 
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.statusCounts.interviewing || 0} applications in interview stage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.totalApplications 
                ? `${Math.round((stats.statusCounts.offer / stats.totalApplications) * 100) || 0}%` 
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.statusCounts.offer || 0} offers received
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Distribution of your job applications by current status
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} applications`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No application data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
            <CardDescription>
              Number of job applications submitted in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {last7DaysData.length > 0 && last7DaysData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} applications`, "Count"]} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No recent application data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Applications and Reminders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your most recently submitted job applications</CardDescription>
            </div>
            <Link to="/applications">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                View All <ArrowUpRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <Link to={`/applications/${app.id}`} className="font-medium hover:underline">
                        {app.position}
                      </Link>
                      <div className="text-sm text-muted-foreground">{app.companyName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(app.status)}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(app.dateApplied), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">No applications yet</p>
                <Link to="/applications/new">
                  <Button variant="outline">Add Your First Application</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Don't forget your follow-ups and interviews</CardDescription>
            </div>
            <Link to="/calendar">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                Calendar <ArrowUpRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-4">
                {upcomingReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{reminder.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {isToday(parseISO(reminder.date)) ? "Today" : format(parseISO(reminder.date), "MMM d, yyyy")}
                        {" at "}
                        {format(parseISO(reminder.date), "h:mm a")}
                      </div>
                    </div>
                    <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">No upcoming reminders</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <Link to="/applications" className="w-full">
              <Button variant="outline" className="w-full">
                Set Reminders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
