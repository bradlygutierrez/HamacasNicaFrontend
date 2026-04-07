import { SideBar } from "../_components/sideBar";
export default function SidebarLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex gap-2 min-h-screen">
         <SideBar/>
         <main className="flex-1">{children}</main>
      </div>
    );
  }