import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  LayoutDashboard, 
  FolderOpen, 
  Plus, 
  User, 
  LogOut, 
  Menu,
  X,
  MessageSquare,
  FileText
} from 'lucide-react';

const DashboardLayout = ({ children, userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const builderNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/builder/dashboard', testid: 'nav-dashboard' },
    { name: 'My Projects', icon: FolderOpen, path: '/builder/projects', testid: 'nav-projects' },
    { name: 'Post Project', icon: Plus, path: '/builder/projects/new', testid: 'nav-post-project' },
  ];

  const contractorNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/contractor/dashboard', testid: 'nav-dashboard' },
    { name: 'Browse Projects', icon: FolderOpen, path: '/contractor/projects', testid: 'nav-browse-projects' },
    { name: 'My Bids', icon: MessageSquare, path: '/contractor/bids', testid: 'nav-my-bids' },
    { name: 'Profile', icon: User, path: '/contractor/profile', testid: 'nav-profile' },
  ];

  const navItems = userType === 'builder' ? builderNav : contractorNav;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="mobile-menu-toggle"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">BuildConnect</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.user_type}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
                data-testid="logout-btn"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={item.testid}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;