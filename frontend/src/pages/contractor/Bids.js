import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContractorBids = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await axios.get(`${API}/contractor/bids`);
      setBids(response.data);
    } catch (error) {
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const filteredBids = activeTab === 'all' 
    ? bids 
    : bids.filter(bid => bid.status === activeTab);

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
      <div className="animate-fade-in" data-testid="contractor-bids-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600 mt-1">Track the status of all your submitted bids</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all" data-testid="tab-all">All ({bids.length})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending ({bids.filter(b => b.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-accepted">Accepted ({bids.filter(b => b.status === 'accepted').length})</TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected ({bids.filter(b => b.status === 'rejected').length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bids List */}
        {filteredBids.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {activeTab === 'all' ? 'No bids submitted yet' : `No ${activeTab} bids`}
              </p>
              {activeTab === 'all' && (
                <Button 
                  onClick={() => navigate('/contractor/projects')} 
                  className="btn-primary text-white"
                >
                  Browse Projects
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <Card key={bid.id} className="p-6" data-testid={`bid-item-${bid.id}`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{bid.project_title}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted on {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`status-badge status-${bid.status} ml-4`}>
                        {bid.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Your Quoted Price</p>
                          <p className="text-2xl font-bold text-blue-600">₹{(bid.quoted_price / 100000).toFixed(2)}L</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Your Duration</p>
                          <p className="text-2xl font-bold text-gray-900">{bid.estimated_duration} days</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Your Proposal</h5>
                      <p className="text-gray-700 leading-relaxed line-clamp-3">{bid.proposal}</p>
                    </div>

                    {bid.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-semibold">
                          ✅ Congratulations! Your bid has been accepted. The builder will contact you soon.
                        </p>
                      </div>
                    )}

                    {bid.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">
                          Your bid was not selected for this project. Keep bidding on other projects!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-48 flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(`/contractor/projects/${bid.project_id}`)}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full"
                      data-testid={`view-project-btn-${bid.id}`}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Project
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

export default ContractorBids;