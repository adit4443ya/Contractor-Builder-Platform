import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FolderOpen, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CITIES = ['All', 'Patna', 'Lucknow', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Jaipur'];
const PROJECT_TYPES = ['All', 'residential', 'commercial', 'infrastructure', 'renovation'];

const ContractorProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCity, selectedType]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/contractor/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (selectedCity !== 'All') {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(p => p.project_type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const isDeadlineSoon = (deadline) => {
    const daysUntil = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil > 0;
  };

  const isNew = (createdAt) => {
    const hoursOld = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
    return hoursOld < 24;
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
      <div className="animate-fade-in" data-testid="contractor-projects-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
          <p className="text-gray-600 mt-1">Find and bid on construction projects that match your expertise</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-projects-input"
              />
            </div>

            <div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger data-testid="filter-city-select">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="filter-type-select">
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="mb-4 text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredProjects.length}</span> projects
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm || selectedCity !== 'All' || selectedType !== 'All' 
                  ? 'No projects match your filters' 
                  : 'No open projects available'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-6 cursor-pointer card-hover"
                onClick={() => navigate(`/contractor/projects/${project.id}`)}
                data-testid={`project-item-${project.id}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                        {isNew(project.created_at) && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">NEW</span>
                        )}
                        {isDeadlineSoon(project.bidding_deadline) && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">URGENT</span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.city}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {project.duration_days} days
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.required_specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Budget Range</p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(project.budget_min / 100000).toFixed(1)}L - ₹{(project.budget_max / 100000).toFixed(1)}L
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Bids</p>
                        <p className="text-lg font-bold text-gray-900">{project.bid_count}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contractor/projects/${project.id}`);
                      }}
                      className="btn-primary text-white"
                      data-testid={`view-project-btn-${project.id}`}
                    >
                      View & Bid
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

export default ContractorProjects;