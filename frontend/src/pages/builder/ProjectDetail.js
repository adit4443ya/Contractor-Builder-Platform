import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, Star, Award } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BuilderProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awardingBid, setAwardingBid] = useState(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`${API}/builder/projects/${projectId}`);
      setProject(response.data.project);
      setBids(response.data.bids);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/builder/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBid = async () => {
    if (!awardingBid) return;

    try {
      await axios.post(`${API}/builder/projects/${projectId}/award/${awardingBid}`);
      toast.success('Bid awarded successfully!');
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to award bid');
    } finally {
      setShowAwardDialog(false);
      setAwardingBid(null);
    }
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

  if (!project) return null;

  const sortedBids = [...bids].sort((a, b) => a.quoted_price - b.quoted_price);

  return (
    <DashboardLayout userType="builder">
      <div className="animate-fade-in" data-testid="project-detail-page">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/builder/projects')}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>

        {/* Project Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
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
              <p className="text-sm text-gray-600 mb-1">Bids Received</p>
              <p className="text-xl font-bold text-blue-600">{bids.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bidding Deadline</p>
              <p className="text-xl font-bold text-orange-600">
                {new Date(project.bidding_deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details" className="mb-6">
          <TabsList>
            <TabsTrigger value="details" data-testid="tab-details">Project Details</TabsTrigger>
            <TabsTrigger value="bids" data-testid="tab-bids">Bids ({bids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
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
          </TabsContent>

          <TabsContent value="bids" className="mt-6">
            {bids.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bids received yet</p>
                  <p className="text-gray-400 text-sm mt-2">Contractors will see your project and submit bids soon.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedBids.map((bid, index) => (
                  <Card key={bid.id} className="bid-card" data-testid={`bid-card-${bid.id}`}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{bid.contractor_company}</h4>
                            <p className="text-gray-600">{bid.contractor_name}</p>
                          </div>
                          {index === 0 && bid.status === 'pending' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              LOWEST BID
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="ml-1 font-semibold text-gray-900">{bid.contractor_rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{bid.contractor_experience} years experience</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{bid.contractor_total_projects} projects completed</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Quoted Price</p>
                              <p className="text-2xl font-bold text-blue-600">₹{(bid.quoted_price / 100000).toFixed(2)}L</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Duration</p>
                              <p className="text-2xl font-bold text-gray-900">{bid.estimated_duration} days</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Proposal</h5>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{bid.proposal}</p>
                        </div>

                        {bid.attachments && bid.attachments.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Attachments</h5>
                            <div className="space-y-2">
                              {bid.attachments.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 block">
                                  Document {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:w-48 flex flex-col gap-2">
                        <span className={`status-badge status-${bid.status} text-center`}>
                          {bid.status}
                        </span>
                        <p className="text-sm text-gray-500 text-center">
                          Submitted {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                        {bid.status === 'pending' && project.status === 'open' && (
                          <Button
                            onClick={() => {
                              setAwardingBid(bid.id);
                              setShowAwardDialog(true);
                            }}
                            className="btn-primary text-white mt-2"
                            data-testid={`award-bid-btn-${bid.id}`}
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Award Bid
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Award Confirmation Dialog */}
        <AlertDialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Award This Bid?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to award this project to this contractor? This will close bidding and notify the contractor. Other bids will be automatically rejected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAwardBid} className="bg-blue-600 hover:bg-blue-700">
                Confirm Award
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default BuilderProjectDetail;