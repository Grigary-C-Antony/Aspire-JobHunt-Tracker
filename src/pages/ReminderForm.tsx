
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { getApplicationById, getRemindersByApplicationId, saveReminder, deleteReminder, toggleReminderDone } from "@/lib/storage";
import { JobApplication, Reminder } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ReminderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<Omit<Reminder, "id" | "applicationId">>({
    date: new Date().toISOString(),
    description: "",
    isDone: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), "HH:mm")
  );

  useEffect(() => {
    if (id) {
      const app = getApplicationById(id);
      if (app) {
        setApplication(app);
        loadReminders();
      } else {
        toast.error("Application not found");
        navigate("/applications");
      }
    }
  }, [id, navigate]);

  const loadReminders = () => {
    if (id) {
      const appReminders = getRemindersByApplicationId(id);
      setReminders(appReminders);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      updateReminderDateTime(date, selectedTime);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
    updateReminderDateTime(selectedDate, e.target.value);
  };

  const updateReminderDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    setNewReminder({ ...newReminder, date: newDate.toISOString() });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReminder({ ...newReminder, description: e.target.value });
  };

  const handleAddReminder = () => {
    if (!newReminder.description.trim()) {
      toast.error("Please enter a reminder description");
      return;
    }

    if (!id) return;

    const reminder: Reminder = {
      id: uuidv4(),
      applicationId: id,
      ...newReminder,
    };

    saveReminder(reminder);
    loadReminders();
    
    // Reset the form
    setNewReminder({
      date: new Date().toISOString(),
      description: "",
      isDone: false,
    });
    setSelectedDate(new Date());
    setSelectedTime(format(new Date(), "HH:mm"));
    
    toast.success("Reminder added successfully");
  };

  const handleToggleDone = (reminderId: string) => {
    toggleReminderDone(reminderId);
    loadReminders();
  };

  const handleDeleteReminder = (reminderId: string) => {
    deleteReminder(reminderId);
    loadReminders();
    toast.success("Reminder deleted");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to Application
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set Reminders</CardTitle>
            <CardDescription>
              {application
                ? `Create reminders for your application to ${application.companyName}`
                : "Loading application..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Reminder Description</Label>
              <Input
                id="description"
                placeholder="e.g., Follow up on application status"
                value={newReminder.description}
                onChange={handleDescriptionChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center border rounded-md">
                  <span className="pl-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="border-0"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddReminder}
              className="w-full mt-2 flex items-center gap-1"
            >
              <Plus size={16} />
              Add Reminder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Reminders</CardTitle>
            <CardDescription>
              {reminders.length === 0
                ? "No reminders set for this application yet"
                : `${reminders.length} reminder${
                    reminders.length === 1 ? "" : "s"
                  } for this application`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={reminder.isDone}
                        onCheckedChange={() => handleToggleDone(reminder.id)}
                        id={`checkbox-${reminder.id}`}
                      />
                      <div>
                        <p
                          className={cn(
                            reminder.isDone && "line-through text-muted-foreground"
                          )}
                        >
                          {reminder.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reminder.date), "PPP")} at{" "}
                          {format(new Date(reminder.date), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No reminders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReminderForm;
