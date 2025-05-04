
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApplications, getReminders } from "@/lib/storage";
import { JobApplication, Reminder } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const CalendarView = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const allReminders = getReminders();
    setReminders(allReminders);
    
    const allApplications = getApplications();
    setApplications(allApplications);
  };
  
  const getRemindersByDate = (day: Date) => {
    return reminders.filter(reminder => 
      isSameDay(parseISO(reminder.date), day)
    );
  };
  
  const getApplicationsByDate = (day: Date) => {
    return applications.filter(app => 
      isSameDay(parseISO(app.dateApplied), day)
    );
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View your applications and reminders by date
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <CardDescription>
                  Your applications and reminders
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                components={{
                  day: (props) => {
                    const day = props.date;
                    const dayReminders = getRemindersByDate(day);
                    const dayApplications = getApplicationsByDate(day);
                    const hasEvents = dayReminders.length > 0 || dayApplications.length > 0;
                    
                    return (
                      <div
                        className={cn(
                          "relative flex items-center justify-center p-0",
                          props.outOfMonth && "text-muted-foreground opacity-50",
                        )}
                        {...props}
                      >
                        <time dateTime={format(day, "yyyy-MM-dd")}>
                          {format(day, "d")}
                        </time>
                        {hasEvents && (
                          <div className="absolute bottom-1 flex gap-0.5">
                            {dayReminders.length > 0 && (
                              <div className="h-1 w-1 rounded-full bg-primary" />
                            )}
                            {dayApplications.length > 0 && (
                              <div className="h-1 w-1 rounded-full bg-secondary-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDay
                  ? format(selectedDay, "MMMM d, yyyy")
                  : "Select a date"}
              </CardTitle>
              <CardDescription>
                Activities for this day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDay && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Reminders</h3>
                    {getRemindersByDate(selectedDay).length > 0 ? (
                      <div className="space-y-2">
                        {getRemindersByDate(selectedDay).map((reminder) => {
                          const application = applications.find(
                            (app) => app.id === reminder.applicationId
                          );
                          
                          return (
                            <div
                              key={reminder.id}
                              className={cn(
                                "p-3 rounded-md border",
                                reminder.isDone
                                  ? "bg-muted/50 text-muted-foreground"
                                  : "bg-primary/5"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="text-sm font-medium">
                                  {reminder.description}
                                </div>
                                <Badge
                                  variant={reminder.isDone ? "outline" : "default"}
                                  className="text-xs"
                                >
                                  {reminder.isDone ? "Done" : "Pending"}
                                </Badge>
                              </div>
                              {application && (
                                <Link
                                  to={`/applications/${application.id}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {application.companyName} - {application.position}
                                </Link>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(reminder.date), "h:mm a")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No reminders for this day
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Applications</h3>
                    {getApplicationsByDate(selectedDay).length > 0 ? (
                      <div className="space-y-2">
                        {getApplicationsByDate(selectedDay).map((application) => (
                          <Link
                            key={application.id}
                            to={`/applications/${application.id}`}
                            className="block p-3 rounded-md border bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <div className="font-medium">
                              {application.position}
                            </div>
                            <div className="text-sm">
                              {application.companyName}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                Applied on{" "}
                                {format(parseISO(application.dateApplied), "MMM d")}
                              </span>
                              <Badge
                                variant={
                                  application.status === "applied"
                                    ? "outline"
                                    : application.status === "interviewing"
                                    ? "secondary"
                                    : application.status === "offer"
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs capitalize"
                              >
                                {application.status}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No applications for this day
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {!selectedDay && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Select a date to view events
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function for conditionally joining classes
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

export default CalendarView;
