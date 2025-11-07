import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SPECIALIZATIONS = [
  'Civil Engineering',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Masonry',
  'Painting',
  'Roofing',
  'HVAC',
  'Interior Design'
];

const CITIES = ['Patna', 'Lucknow', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Jaipur'];

const NewProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: 'residential',
    location: '',
    city: '',
    required_specializations: [],
    budget_min: '',
    budget_max: '',
    start_date: '',
    duration_days: '',
    bidding_deadline: '',
    document_url: ''
  });

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      required_specializations: prev.required_specializations.includes(spec)
        ? prev.required_specializations.filter(s => s !== spec)
        : [...prev.required_specializations, spec]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (formData.title.length < 10) {
      toast.error('Title must be at least 10 characters');
      return;
    }

    if (formData.description.length < 50) {
      toast.error('Description must be at least 50 characters');
      return;
    }

    if (formData.required_specializations.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }

    if (parseInt(formData.budget_min) >= parseInt(formData.budget_max)) {
      toast.error('Maximum budget must be greater than minimum budget');
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        ...formData,
        budget_min: parseInt(formData.budget_min),
        budget_max: parseInt(formData.budget_max),
        duration_days: parseInt(formData.duration_days)
      };

      const response = await axios.post(`${API}/builder/projects`, projectData);
      toast.success('Project posted successfully!');
      navigate(`/builder/projects/${response.data.project_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="builder">
      <div className="animate-fade-in" data-testid="new-project-page">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/builder/projects')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Post New Project</h1>
          <p className="text-gray-600 mt-1">Create a detailed project listing to attract qualified contractors</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8" data-testid="new-project-form">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">Project Title *</Label>
                  <Input
                    id="title"
                    data-testid="project-title-input"
                    required
                    className="mt-1"
                    placeholder="e.g., Residential Building Construction in Patna"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="project_type" className="text-gray-700 font-medium">Project Type *</Label>
                  <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                    <SelectTrigger className="mt-1" data-testid="project-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    data-testid="project-description-input"
                    required
                    rows={6}
                    className="mt-1"
                    placeholder="Provide detailed information about your project, including scope, specific requirements, and any special considerations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 50 characters</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className="mt-1" data-testid="project-city-select">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 font-medium">Detailed Location *</Label>
                  <Input
                    id="location"
                    data-testid="project-location-input"
                    required
                    className="mt-1"
                    placeholder="e.g., Boring Road, Near Gandhi Maidan"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium mb-3 block">Required Specializations *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SPECIALIZATIONS.map(spec => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={formData.required_specializations.includes(spec)}
                          onCheckedChange={() => handleSpecializationToggle(spec)}
                          data-testid={`spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={spec} className="cursor-pointer text-sm">{spec}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_min" className="text-gray-700 font-medium">Minimum Budget (₹) *</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      data-testid="budget-min-input"
                      required
                      className="mt-1"
                      placeholder="1500000"
                      value={formData.budget_min}
                      onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget_max" className="text-gray-700 font-medium">Maximum Budget (₹) *</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      data-testid="budget-max-input"
                      required
                      className="mt-1"
                      placeholder="2000000"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-gray-700 font-medium">Expected Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      data-testid="start-date-input"
                      required
                      className="mt-1"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration_days" className="text-gray-700 font-medium">Duration (Days) *</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      data-testid="duration-input"
                      required
                      className="mt-1"
                      placeholder="60"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bidding_deadline" className="text-gray-700 font-medium">Bidding Deadline *</Label>
                  <Input
                    id="bidding_deadline"
                    type="datetime-local"
                    data-testid="bidding-deadline-input"
                    required
                    className="mt-1"
                    value={formData.bidding_deadline}
                    onChange={(e) => setFormData({ ...formData, bidding_deadline: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="document_url" className="text-gray-700 font-medium">Tender Document URL (Optional)</Label>
                  <Input
                    id="document_url"
                    type="url"
                    data-testid="document-url-input"
                    className="mt-1"
                    placeholder="https://example.com/tender-document.pdf"
                    value={formData.document_url}
                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary text-white px-8"
                data-testid="submit-project-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Posting Project...
                  </>
                ) : (
                  'Post Project'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/builder/projects')}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewProject;