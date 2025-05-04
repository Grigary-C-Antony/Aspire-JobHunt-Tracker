
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import Dashboard from "@/pages/Dashboard";
import ApplicationList from "@/pages/ApplicationList";
import ApplicationDetail from "@/pages/ApplicationDetail";
import ApplicationForm from "@/components/application-form";
import KanbanBoard from "@/pages/KanbanBoard";
import CalendarView from "@/pages/CalendarView";
import StatisticsPage from "@/pages/StatisticsPage";
import ReminderForm from "@/pages/ReminderForm";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import { v4 as uuidv4 } from "uuid";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applications" element={<ApplicationList />} />
              <Route path="/applications/new" element={<ApplicationForm />} />
              <Route path="/applications/:id" element={<ApplicationDetail />} />
              <Route path="/applications/edit/:id" element={
                <ApplicationForm initialData={null} />
              } />
              <Route path="/applications/:id/reminders" element={<ReminderForm />} />
              <Route path="/board" element={<KanbanBoard />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
