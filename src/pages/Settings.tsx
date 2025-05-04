
import React, { useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const darkMode = localStorage.getItem("aspire-ui-theme") === "dark";
    setDarkModeEnabled(darkMode);

    const notifications = localStorage.getItem("aspire-notifications") === "true";
    setNotificationsEnabled(notifications);
  }, []);

  const handleExportData = () => {
    // Get all data from localStorage
    const applications = localStorage.getItem("aspire_job_applications") || "[]";
    const reminders = localStorage.getItem("aspire_reminders") || "[]";

    // Create a blob with the data
    const data = {
      applications: JSON.parse(applications),
      reminders: JSON.parse(reminders),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create a link and click it to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download = `aspire-data-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data.applications || !data.reminders) {
          throw new Error("Invalid data format");
        }

        // Update localStorage with imported data
        localStorage.setItem(
          "aspire_job_applications",
          JSON.stringify(data.applications)
        );
        localStorage.setItem(
          "aspire_reminders",
          JSON.stringify(data.reminders)
        );

        toast.success("Data imported successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error("Failed to import data: Invalid format");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("aspire_job_applications");
      localStorage.removeItem("aspire_reminders");
      toast.success("All data has been cleared");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how Aspire looks for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <ModeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for upcoming events
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  setNotificationsEnabled(checked);
                  localStorage.setItem(
                    "aspire-notifications",
                    checked.toString()
                  );
                  toast.success(
                    checked
                      ? "Notifications enabled"
                      : "Notifications disabled"
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export or import your application data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download a backup of your application data
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Import Data</Label>
                <p className="text-sm text-muted-foreground">
                  Restore from a previous backup
                </p>
              </div>
              <div>
                <input
                  type="file"
                  id="import-data"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("import-data")?.click()
                  }
                >
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleClearData}>
              Clear All Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Application information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium">Aspire - Job Application Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0
              </p>
              <p className="text-sm text-muted-foreground">
                Built with React, TypeScript, and TailwindCSS
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
