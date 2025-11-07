import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const defaultType = searchParams.get('type') || 'builder';

  const [formData, setFormData] = useState({
    user_type: defaultType,
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await signup(signupData);
      toast.success('Account created successfully!');
      navigate(response.redirect_to);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-gradient">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join BuildConnect today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" data-testid="signup-form">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-medium mb-3 block">I am a</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="builder" id="builder" data-testid="signup-type-builder" />
                  <Label htmlFor="builder" className="cursor-pointer font-medium">Builder</Label>
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="contractor" id="contractor" data-testid="signup-type-contractor" />
                  <Label htmlFor="contractor" className="cursor-pointer font-medium">Contractor</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="full_name" className="text-gray-700 font-medium">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                data-testid="signup-name-input"
                required
                className="mt-1 input-field"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                data-testid="signup-email-input"
                required
                className="mt-1 input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                data-testid="signup-phone-input"
                required
                className="mt-1 input-field"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="company_name" className="text-gray-700 font-medium">Company Name</Label>
              <Input
                id="company_name"
                type="text"
                data-testid="signup-company-input"
                required
                className="mt-1 input-field"
                placeholder="Your Company"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="signup-password-input"
                required
                className="mt-1 input-field"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="signup-confirm-password-input"
                required
                className="mt-1 input-field"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            data-testid="signup-submit-btn"
            disabled={loading}
            className="w-full btn-primary text-white py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold" data-testid="signup-login-link">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;