import BottomBar from "@/components/shared/bottombar";
import Navbar from "@/components/shared/navbar";

export default function AppLayout({ children }) {
  return (
      <div className="min-h-screen py-3 px-3 space-y-5 relative bg-gray-50">
        <Navbar/>
        {children}
        <BottomBar/>
      </div>
  );
}
