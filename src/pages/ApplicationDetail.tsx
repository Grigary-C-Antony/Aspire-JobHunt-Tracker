
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  getApplicationById,
  getReminders,
  updateApplicationStatus,
  deleteApplication,
} from "@/lib/storage";
import { JobApplication, Reminder } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Trash2,
  CalendarClock,
  Bell,
  ExternalLink,
  Mail,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const app = getApplicationById(id);
      if (app) {
        setApplication(app);
        
        // Get reminders for this application
        const appReminders = getReminders().filter(r => r.applicationId === id);
        setReminders(appReminders);
      } else {
        toast.error("Application not found");
        navigate("/applications");
      }
      setLoading(false);
    }
  }, [id, navigate]);

  const handleStatusChange = (newStatus: JobApplication["status"]) => {
    if (id) {
      const updatedApp = updateApplicationStatus(id, newStatus);
      if (updatedApp) {
        setApplication(updatedApp);
        toast.success(`Status updated to ${newStatus}`);
      }
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      if (id) {
        deleteApplication(id);
        toast.success("Application deleted successfully");
        navigate("/applications");
      }
    }
  };

  const getStatusIcon = (status: JobApplication["status"]) => {
    switch (status) {
      case "applied":
        return <Clock className="w-4 h-4" />;
      case "interviewing":
        return <Calendar className="w-4 h-4" />;
      case "offer":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: JobApplication["status"]) => {
    const variants: Record<
      JobApplication["status"],
      "outline" | "default" | "destructive" | "secondary"
    > = {
      applied: "outline",
      interviewing: "secondary",
      offer: "default",
      rejected: "destructive",
    };

    return (
      <Badge variant={variants[status]} className="flex gap-1 items-center capitalize">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-xl mb-4">Application not found</p>
        <Link to="/applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to Applications
        </Button>
        <div className="flex gap-2">
          <Link to={`/applications/edit/${id}`}>
            <Button variant="outline" className="flex items-center gap-1">
              <Pencil size={16} />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-1">
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-2xl">{application.position}</CardTitle>
                  <CardDescription className="text-lg">
                    {application.companyName}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  {getStatusBadge(application.status)}
                  <span className="text-sm text-muted-foreground mt-1">
                    Applied on {format(new Date(application.dateApplied), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">About the Role</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{application.location || "Not specified"}</p>
                  </div>
                  {application.salary && (
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p>{application.salary}</p>
                    </div>
                  )}
                </div>
              </div>

              {application.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {application.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.jobDescription && (
                <div>
                  <h3 className="font-semibold mb-1">Job Description</h3>
                  <div className="bg-secondary/50 p-3 rounded-lg text-sm whitespace-pre-line max-h-72 overflow-y-auto">
                    {application.jobDescription}
                  </div>
                </div>
              )}

              {application.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Notes</h3>
                  <div className="bg-secondary/30 p-3 rounded-lg text-sm whitespace-pre-line">
                    {application.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={application.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Application Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Updated: {format(new Date(application.dateUpdated), "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Details</span>
                {application.resumeVersion && (
                  <Badge variant="outline">{application.resumeVersion}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.contactName && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p>{application.contactName}</p>
                </div>
              )}

              {application.contactEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${application.contactEmail}`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {application.contactEmail}
                  </a>
                </div>
              )}

              {application.url && (
                <div>
                  <p className="text-sm text-muted-foreground">Job URL</p>
                  <a
                    href={application.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">{application.url}</span>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Reminders</span>
                <Link to={`/applications/${id}/reminders`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-1"
                  >
                    <Bell className="h-3 w-3" />
                    Add
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length > 0 ? (
                <ul className="space-y-3">
                  {reminders.map((reminder) => (
                    <li
                      key={reminder.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className={reminder.isDone ? "line-through text-muted-foreground" : ""}>
                          {reminder.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reminder.date), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No reminders set</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
