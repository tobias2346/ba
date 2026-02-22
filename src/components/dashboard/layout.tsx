import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { DashboardSidebarContent } from "@/components/dashboard/sidebar-content";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
