import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Loader2, Star } from 'lucide-react';
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

const ContractorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    specializations: [],
    experience_years: '',
    team_size: '',
    service_locations: [],
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/contractor/profile`);
      const profileData = response.data.profile;
      setProfile(profileData);
      setFormData({
        specializations: profileData.specializations || [],
        experience_years: profileData.experience_years || '',
        team_size: profileData.team_size || '',
        service_locations: profileData.service_locations || [],
        bio: profileData.bio || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleLocationToggle = (city) => {
    setFormData(prev => ({
      ...prev,
      service_locations: prev.service_locations.includes(city)
        ? prev.service_locations.filter(c => c !== city)
        : [...prev.service_locations, city]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.specializations.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }

    if (formData.service_locations.length === 0) {
      toast.error('Please select at least one service location');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        specializations: formData.specializations,
        experience_years: parseInt(formData.experience_years) || 0,
        team_size: parseInt(formData.team_size) || 0,
        service_locations: formData.service_locations,
        bio: formData.bio
      };

      await axios.put(`${API}/contractor/profile`, updateData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="animate-fade-in" data-testid="contractor-profile-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Keep your profile updated to attract more projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="p-6 lg:col-span-1 h-fit">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{profile?.user_id}</h3>
              <div className="flex items-center justify-center text-yellow-500 mb-4">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1 font-semibold text-gray-900">{profile?.rating?.toFixed(1) || '0.0'}</span>
                <span className="ml-1 text-gray-500 text-sm">({profile?.total_projects || 0} projects)</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-semibold text-gray-900">{profile?.experience_years || 0} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-semibold text-gray-900">{profile?.team_size || 0} workers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`status-badge status-${profile?.verification_status || 'pending'}`}>
                    {profile?.verification_status || 'pending'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={handleSubmit} data-testid="profile-form">
              <div className="space-y-6">
                {/* Professional Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience_years" className="text-gray-700 font-medium">Years of Experience</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          data-testid="experience-input"
                          className="mt-1"
                          placeholder="12"
                          value={formData.experience_years}
                          onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="team_size" className="text-gray-700 font-medium">Team Size</Label>
                        <Input
                          id="team_size"
                          type="number"
                          data-testid="team-size-input"
                          className="mt-1"
                          placeholder="25"
                          value={formData.team_size}
                          onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium mb-3 block">Specializations *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SPECIALIZATIONS.map(spec => (
                          <div key={spec} className="flex items-center space-x-2">
                            <Checkbox
                              id={`spec-${spec}`}
                              checked={formData.specializations.includes(spec)}
                              onCheckedChange={() => handleSpecializationToggle(spec)}
                              data-testid={`spec-checkbox-${spec.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <Label htmlFor={`spec-${spec}`} className="cursor-pointer text-sm">{spec}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium mb-3 block">Service Locations *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {CITIES.map(city => (
                          <div key={city} className="flex items-center space-x-2">
                            <Checkbox
                              id={`city-${city}`}
                              checked={formData.service_locations.includes(city)}
                              onCheckedChange={() => handleLocationToggle(city)}
                              data-testid={`city-checkbox-${city.toLowerCase()}`}
                            />
                            <Label htmlFor={`city-${city}`} className="cursor-pointer text-sm">{city}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About You</h3>
                  <div>
                    <Label htmlFor="bio" className="text-gray-700 font-medium">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      data-testid="bio-input"
                      rows={6}
                      className="mt-1"
                      placeholder="Tell builders about your experience, expertise, notable projects, and what makes your services unique..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-white px-8"
                    data-testid="save-profile-btn"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractorProfile;