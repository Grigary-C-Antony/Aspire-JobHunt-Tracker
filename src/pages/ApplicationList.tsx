
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApplications, deleteApplication } from "@/lib/storage";
import { JobApplication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ApplicationList = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dateDesc");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchQuery, statusFilter, sortBy]);

  const loadApplications = () => {
    const data = getApplications();
    setApplications(data);
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.companyName.toLowerCase().includes(query) ||
          app.position.toLowerCase().includes(query) ||
          app.location.toLowerCase().includes(query) ||
          (app.notes && app.notes.toLowerCase().includes(query)) ||
          app.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "dateAsc":
          return (
            new Date(a.dateApplied).getTime() -
            new Date(b.dateApplied).getTime()
          );
        case "dateDesc":
          return (
            new Date(b.dateApplied).getTime() -
            new Date(a.dateApplied).getTime()
          );
        case "companyAsc":
          return a.companyName.localeCompare(b.companyName);
        case "companyDesc":
          return b.companyName.localeCompare(a.companyName);
        default:
          return (
            new Date(b.dateApplied).getTime() -
            new Date(a.dateApplied).getTime()
          );
      }
    });

    setFilteredApplications(filtered);
  };

  const handleDeleteApplication = (id: string) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this application?")) {
      deleteApplication(id);
      loadApplications();
      toast.success("Application deleted successfully");
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
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage and track your job applications
          </p>
        </div>
        <Link to="/applications/new">
          <Button className="flex gap-2">
            <Plus size={18} />
            New Application
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Found {filteredApplications.length} job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateDesc">Newest First</SelectItem>
                  <SelectItem value="dateAsc">Oldest First</SelectItem>
                  <SelectItem value="companyAsc">Company (A-Z)</SelectItem>
                  <SelectItem value="companyDesc">Company (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>{application.companyName}</TableCell>
                      <TableCell>{application.position}</TableCell>
                      <TableCell>
                        {application.location || "Not specified"}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(application.dateApplied),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`/applications/${application.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link to={`/applications/edit/${application.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <Link to={`/applications/${application.id}/reminders`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Bell className="mr-2 h-4 w-4" />
                                Set Reminders
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteApplication(application.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No applications match your search criteria"
                  : "No applications added yet"}
              </p>
              <Link to="/applications/new">
                <Button>Add Your First Application</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationList;
