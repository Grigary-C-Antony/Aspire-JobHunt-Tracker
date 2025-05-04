
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

import { JobApplication } from "@/lib/types";
import { saveApplication } from "@/lib/storage";

interface ApplicationFormProps {
  initialData?: JobApplication;
  onSubmit?: (data: JobApplication) => void;
}

const ApplicationForm = ({ initialData, onSubmit }: ApplicationFormProps) => {
  const isEditing = !!initialData;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<JobApplication>(
    initialData || {
      id: uuidv4(),
      companyName: "",
      position: "",
      status: "applied",
      dateApplied: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      location: "",
      jobDescription: "",
      salary: "",
      notes: "",
      resumeVersion: "",
      url: "",
      contactEmail: "",
      contactName: "",
      tags: [],
    }
  );
  
  const [dateApplied, setDateApplied] = useState<Date | undefined>(
    formData.dateApplied ? new Date(formData.dateApplied) : undefined
  );
  
  const [tagInput, setTagInput] = useState("");
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setDateApplied(date);
    if (date) {
      setFormData(prev => ({ ...prev, dateApplied: date.toISOString() }));
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedApplication = {
      ...formData,
      dateUpdated: new Date().toISOString(),
    };
    
    saveApplication(updatedApplication);
    
    if (onSubmit) {
      onSubmit(updatedApplication);
    }
    
    toast.success(
      isEditing
        ? "Application updated successfully"
        : "Application added successfully"
    );
    
    navigate("/applications");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Application" : "New Application"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Job title"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State or Remote"
                />
              </div>
              
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Expected or offered salary"
                />
              </div>
            </div>
            
            {/* Application Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offer">Offer Received</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dateApplied">Date Applied *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateApplied && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateApplied ? (
                        format(dateApplied, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateApplied}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="resumeVersion">Resume Version</Label>
                <Input
                  id="resumeVersion"
                  name="resumeVersion"
                  value={formData.resumeVersion || ""}
                  onChange={handleChange}
                  placeholder="e.g., Technical_v2"
                />
              </div>
              
              <div>
                <Label htmlFor="url">Job URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/job-posting"
                  type="url"
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactName">Contact Person</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName || ""}
                onChange={handleChange}
                placeholder="Recruiter or hiring manager name"
              />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail || ""}
                onChange={handleChange}
                placeholder="contact@example.com"
                type="email"
              />
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tags (e.g., 'remote', 'tech', 'urgent')"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add Tag
              </Button>
            </div>
          </div>
          
          {/* Description and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription || ""}
                onChange={handleChange}
                placeholder="Paste the job description here"
                className="h-32"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Your notes about this application"
                className="h-32"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update" : "Submit"} Application
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;
