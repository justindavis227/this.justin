import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import MobileNav from '@/components/MobileNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app" id="app-shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {children}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
