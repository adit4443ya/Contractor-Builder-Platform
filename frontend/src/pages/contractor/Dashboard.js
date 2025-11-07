import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Award, Star, Search, Eye, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_bids: 0, won_projects: 0, rating: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        axios.get(`${API}/contractor/dashboard/stats`),
        axios.get(`${API}/contractor/projects`)
      ]);
      setStats(statsRes.data);
      setRecentProjects(projectsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="contractor">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="contractor">
      <div className="animate-fade-in" data-testid="contractor-dashboard">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your activity overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card" data-testid="stat-total-bids">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Bids</p>
                <h3 className="text-4xl font-bold text-blue-600 mt-2">{stats.total_bids}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="stat-card" data-testid="stat-won-projects">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Won Projects</p>
                <h3 className="text-4xl font-bold text-green-600 mt-2">{stats.won_projects}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="stat-card" data-testid="stat-rating">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Your Rating</p>
                <h3 className="text-4xl font-bold text-yellow-600 mt-2">{stats.rating.toFixed(1)}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/contractor/projects')} 
                className="w-full btn-primary text-white justify-start"
                data-testid="quick-action-browse"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Projects
              </Button>
              <Button 
                onClick={() => navigate('/contractor/bids')} 
                variant="outline"
                className="w-full justify-start border-gray-300 hover:border-blue-500"
                data-testid="quick-action-my-bids"
              >
                <Eye className="mr-2 h-5 w-5" />
                View My Bids
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Status</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Complete your profile to increase your chances of winning projects. Add your specializations, experience, and portfolio.
            </p>
            <Button 
              onClick={() => navigate('/contractor/profile')}
              variant="outline"
              className="border-gray-300 hover:border-blue-500"
              data-testid="quick-action-profile"
            >
              Update Profile
            </Button>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">New Projects For You</h3>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/contractor/projects')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All
            </Button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No projects available</p>
              <Button 
                onClick={() => navigate('/contractor/projects')} 
                className="btn-primary text-white"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse All Projects
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card cursor-pointer"
                  onClick={() => navigate(`/contractor/projects/${project.id}`)}
                  data-testid={`project-card-${project.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{project.city} • {project.project_type}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Budget: ₹{(project.budget_min / 100000).toFixed(1)}L - ₹{(project.budget_max / 100000).toFixed(1)}L</span>
                        <span>•</span>
                        <span>{project.bid_count} Bids</span>
                      </div>
                    </div>
                    <span className="status-badge status-open">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContractorDashboard;