import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContractorProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [existingBid, setExistingBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bidData, setBidData] = useState({
    quoted_price: '',
    estimated_duration: '',
    proposal: ''
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`${API}/contractor/projects/${projectId}`);
      setProject(response.data.project);
      setExistingBid(response.data.existing_bid);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/contractor/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (parseInt(bidData.quoted_price) <= 0) {
      toast.error('Quoted price must be positive');
      return;
    }

    if (parseInt(bidData.estimated_duration) <= 0) {
      toast.error('Duration must be positive');
      return;
    }

    if (bidData.proposal.length < 100) {
      toast.error('Proposal must be at least 100 characters');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        project_id: projectId,
        quoted_price: parseInt(bidData.quoted_price),
        estimated_duration: parseInt(bidData.estimated_duration),
        proposal: bidData.proposal,
        attachments: []
      };

      await axios.post(`${API}/contractor/bids`, submitData);
      toast.success('Bid submitted successfully!');
      navigate('/contractor/bids');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
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

  if (!project) return null;

  const deadlinePassed = new Date(project.bidding_deadline) < new Date();

  return (
    <DashboardLayout userType="contractor">
      <div className="animate-fade-in" data-testid="contractor-project-detail-page">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/contractor/projects')}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        {/* Project Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600 mb-2">Posted by {project.builder_company}</p>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}, {project.city}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Start: {new Date(project.start_date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {project.duration_days} days
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`status-badge status-${project.status}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-500">
                Posted {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget Range</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{(project.budget_min / 100000).toFixed(1)}L - ₹{(project.budget_max / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bids Submitted</p>
              <p className="text-xl font-bold text-blue-600">{project.bid_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bidding Deadline</p>
              <p className={`text-xl font-bold ${deadlinePassed ? 'text-red-600' : 'text-orange-600'}`}>
                {new Date(project.bidding_deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Project Details */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Project Description</h3>
          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Project Type</h4>
              <p className="text-gray-700 capitalize">{project.project_type}</p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Required Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {project.required_specializations.map((spec, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {project.document_url && (
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Documents</h4>
              <a
                href={project.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Tender Document
              </a>
            </div>
          )}
        </Card>

        {/* Bid Form or Existing Bid */}
        {existingBid ? (
          <Card className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You've Already Submitted a Bid</h3>
                <p className="text-gray-600 mb-4">Status: <span className={`status-badge status-${existingBid.status} ml-2`}>{existingBid.status}</span></p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Your Quoted Price</p>
                      <p className="text-xl font-bold text-blue-600">₹{(existingBid.quoted_price / 100000).toFixed(2)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Your Duration</p>
                      <p className="text-xl font-bold text-gray-900">{existingBid.estimated_duration} days</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/contractor/bids')}
                  className="btn-primary text-white"
                >
                  View All My Bids
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            {deadlinePassed || project.status !== 'open' ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {deadlinePassed ? 'Bidding Deadline Passed' : 'Bidding Closed'}
                </h3>
                <p className="text-gray-600">This project is no longer accepting bids.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} data-testid="bid-form">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quoted_price" className="text-gray-700 font-medium">Your Quoted Price (₹) *</Label>
                      <Input
                        id="quoted_price"
                        type="number"
                        data-testid="bid-price-input"
                        required
                        className="mt-1"
                        placeholder="1650000"
                        value={bidData.quoted_price}
                        onChange={(e) => setBidData({ ...bidData, quoted_price: e.target.value })}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Budget range: ₹{(project.budget_min / 100000).toFixed(1)}L - ₹{(project.budget_max / 100000).toFixed(1)}L
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="estimated_duration" className="text-gray-700 font-medium">Estimated Duration (Days) *</Label>
                      <Input
                        id="estimated_duration"
                        type="number"
                        data-testid="bid-duration-input"
                        required
                        className="mt-1"
                        placeholder="55"
                        value={bidData.estimated_duration}
                        onChange={(e) => setBidData({ ...bidData, estimated_duration: e.target.value })}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Expected duration: {project.duration_days} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="proposal" className="text-gray-700 font-medium">Your Proposal *</Label>
                    <Textarea
                      id="proposal"
                      data-testid="bid-proposal-input"
                      required
                      rows={8}
                      className="mt-1"
                      placeholder="Provide a detailed proposal explaining your approach, experience with similar projects, team composition, timeline breakdown, and why you're the best fit for this project..."
                      value={bidData.proposal}
                      onChange={(e) => setBidData({ ...bidData, proposal: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-1">Minimum 100 characters ({bidData.proposal.length}/100)</p>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary text-white px-8"
                      data-testid="submit-bid-btn"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Bid...
                        </>
                      ) : (
                        'Submit Bid'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/contractor/projects')}
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContractorProjectDetail;