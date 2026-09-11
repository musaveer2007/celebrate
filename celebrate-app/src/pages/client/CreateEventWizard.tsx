import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { eventService } from '../../services/api';

const CreateEventWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'wedding',
    date: '',
    location: '',
    guest_count: 100,
    budget: 50000,
    style: '',
    services_required: [] as string[],
    additional_notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostEvent = async () => {
    setLoading(true);
    try {
      await eventService.createEvent({
        client_id: user.id,
        title: formData.title,
        event_type: formData.event_type,
        date: formData.date,
        location: formData.location,
        guest_count: Number(formData.guest_count),
        budget: Number(formData.budget),
      });
      navigate('/client');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <div className="flex mb-8 border-b border-slate-200">
        <div className={`px-4 py-2 font-medium ${step === 1 ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>1. Basics</div>
        <div className={`px-4 py-2 font-medium ${step === 2 ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>2. Details</div>
        <div className={`px-4 py-2 font-medium ${step === 3 ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}>3. Review</div>
      </div>

      <div className="card">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} placeholder="e.g. Sarah & John's Wedding" />
            </div>
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select name="event_type" className="form-input bg-white" value={formData.event_type} onChange={handleChange}>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="party">Private Party</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Location (City or Venue)</label>
              <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} />
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-primary" onClick={() => setStep(2)}>Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Expected Guest Count</label>
              <input type="number" name="guest_count" className="form-input" value={formData.guest_count} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Budget ($)</label>
              <input type="number" name="budget" className="form-input" value={formData.budget} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Style / Theme</label>
              <input type="text" name="style" className="form-input" value={formData.style} onChange={handleChange} placeholder="e.g. Modern Minimalist, Rustic" />
            </div>
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea name="additional_notes" className="form-input" rows={4} value={formData.additional_notes} onChange={handleChange}></textarea>
            </div>
            <div className="flex justify-between mt-4">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-4">Event Summary</h3>
            <div className="bg-slate-50 p-4 rounded-md flex flex-col gap-2">
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Type:</strong> {formData.event_type}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Location:</strong> {formData.location}</p>
              <p><strong>Guests:</strong> {formData.guest_count}</p>
              <p><strong>Budget:</strong> ${formData.budget}</p>
              <p><strong>Style:</strong> {formData.style}</p>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Clicking "Post Event" will make your event visible to our Smart Matching Engine, which will find the best planners for you.
            </p>
            <div className="flex justify-between mt-4">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={handlePostEvent} disabled={loading}>
                {loading ? 'Posting...' : 'Post Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventWizard;
