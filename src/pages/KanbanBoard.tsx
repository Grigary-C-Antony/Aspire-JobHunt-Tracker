
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "@/lib/storage";
import { JobApplication, ApplicationStatus } from "@/lib/types";
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
import { Plus, ExternalLink, Building, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statuses: ApplicationStatus[] = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

const statusLabels: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer Received",
  rejected: "Rejected",
};

const KanbanBoard = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const data = getApplications();
    setApplications(data);
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter((app) => app.status === status);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    applicationId: string
  ) => {
    setDraggedItem(applicationId);
    event.dataTransfer.setData("application/id", applicationId);
    // For better drag preview
    if (event.dataTransfer.setDragImage) {
      const elem = event.currentTarget;
      event.dataTransfer.setDragImage(elem, 10, 10);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add("bg-primary/5");
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove("bg-primary/5");
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    status: ApplicationStatus
  ) => {
    event.preventDefault();
    event.currentTarget.classList.remove("bg-primary/5");
    
    const applicationId = event.dataTransfer.getData("application/id");
    const application = applications.find((app) => app.id === applicationId);
    
    if (application && application.status !== status) {
      const updatedApplication = updateApplicationStatus(
        applicationId,
        status
      );
      
      if (updatedApplication) {
        toast.success(`Application moved to ${statusLabels[status]}`);
        loadApplications();
      }
    }
    
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Board View</h1>
          <p className="text-muted-foreground">
            Drag and drop applications between columns to update status
          </p>
        </div>
        <Link to="/applications/new">
          <Button className="flex gap-2">
            <Plus size={18} />
            New Application
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={
                  status === "applied"
                    ? "outline"
                    : status === "interviewing"
                    ? "secondary"
                    : status === "offer"
                    ? "default"
                    : "destructive"
                }
                className="px-2 py-1 font-semibold"
              >
                {statusLabels[status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getApplicationsByStatus(status).length}
              </span>
            </div>

            <div
              className={`space-y-3 p-3 rounded-lg transition-colors min-h-[70vh] ${
                draggedItem ? "border-2 border-dashed" : "border-2 border-transparent"
              }`}
            >
              {getApplicationsByStatus(status).map((application) => (
                <div
                  key={application.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, application.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="p-4 pb-2">
                      <Link to={`/applications/${application.id}`}>
                        <CardTitle className="text-lg flex items-center gap-1 hover:text-primary">
                          {application.position}
                          <ExternalLink size={14} />
                        </CardTitle>
                      </Link>
                      <CardDescription className="flex items-center gap-1">
                        <Building size={14} />
                        {application.companyName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">
                      {application.location && (
                        <p className="truncate text-muted-foreground">
                          {application.location}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {format(
                          new Date(application.dateApplied),
                          "MMM d, yyyy"
                        )}
                      </div>
                      {application.tags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {application.tags[0]}
                          {application.tags.length > 1 &&
                            `+${application.tags.length - 1}`}
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              ))}
              
              {getApplicationsByStatus(status).length === 0 && (
                <div className="flex items-center justify-center h-20 border border-dashed rounded-lg text-muted-foreground">
                  No applications
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
