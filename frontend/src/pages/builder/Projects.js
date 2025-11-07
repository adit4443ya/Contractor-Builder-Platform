import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BuilderProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, activeTab]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/builder/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <DashboardLayout userType="builder">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="builder">
      <div className="animate-fade-in" data-testid="builder-projects-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track all your construction projects</p>
          </div>
          <Button 
            onClick={() => navigate('/builder/projects/new')} 
            className="btn-primary text-white"
            data-testid="new-project-btn"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search projects by title or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-projects-input"
              />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="all" data-testid="tab-all">All ({projects.length})</TabsTrigger>
            <TabsTrigger value="open" data-testid="tab-open">Open ({projects.filter(p => p.status === 'open').length})</TabsTrigger>
            <TabsTrigger value="bidding_closed" data-testid="tab-closed">Closed ({projects.filter(p => p.status === 'bidding_closed').length})</TabsTrigger>
            <TabsTrigger value="awarded" data-testid="tab-awarded">Awarded ({projects.filter(p => p.status === 'awarded').length})</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed ({projects.filter(p => p.status === 'completed').length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm ? 'No projects match your search' : 'No projects yet'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => navigate('/builder/projects/new')} 
                  className="btn-primary text-white"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Project
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-6 cursor-pointer card-hover"
                onClick={() => navigate(`/builder/projects/${project.id}`)}
                data-testid={`project-item-${project.id}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                      <span className={`status-badge status-${project.status} ml-4`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="font-medium">{project.city}</span>
                      <span>•</span>
                      <span>Budget: ₹{(project.budget_min / 100000).toFixed(1)}L - ₹{(project.budget_max / 100000).toFixed(1)}L</span>
                      <span>•</span>
                      <span>{project.duration_days} days</span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{project.bid_count} Bids</span>
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end gap-2">
                    <span className="text-sm text-gray-500">
                      Posted {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builder/projects/${project.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      data-testid={`view-project-btn-${project.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuilderProjects;