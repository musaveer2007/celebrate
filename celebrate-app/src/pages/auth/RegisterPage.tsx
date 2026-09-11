import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signUp({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="form-group flex-1">
            <label className="form-label">First Name</label>
            <input
              name="firstName"
              type="text"
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Last Name</label>
            <input
              name="lastName"
              type="text"
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            name="password"
            type="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label">I am a...</label>
          <select 
            name="role" 
            className="form-input bg-white" 
            value={formData.role} 
            onChange={handleChange}
          >
            <option value="client">Client (Planning an event)</option>
            <option value="planner">Event Planner</option>
            <option value="professional">Event Professional (Vendor/Staff)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
