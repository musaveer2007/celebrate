import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

// Mocking opportunity service
const mockOppService = {
  getOpportunities: () => JSON.parse(localStorage.getItem('opportunities') || '[]'),
  apply: (oppId: string, proId: string) => {
    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
    apps.push({ oppId, proId, status: 'submitted' });
    localStorage.setItem('applications', JSON.stringify(apps));
  }
};

const ProOpportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    // Generate some fake opportunities for demo
    if (!localStorage.getItem('opportunities')) {
      localStorage.setItem('opportunities', JSON.stringify([
        { id: '1', title: 'Wedding Photographer Needed', event: 'Sarah & John Wedding', budget: '$2000', location: 'New York' },
        { id: '2', title: 'Catering for 100 guests', event: 'Corporate Gala', budget: '$5000', location: 'New York' },
      ]));
    }
    setOpportunities(mockOppService.getOpportunities());
  }, []);

  const handleApply = (id: string) => {
    mockOppService.apply(id, user.id);
    alert('Application submitted successfully!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Open Opportunities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map(opp => (
          <div key={opp.id} className="card">
            <h3 className="text-xl font-bold">{opp.title}</h3>
            <p className="text-slate-500 mb-4">{opp.event} • {opp.location}</p>
            <p className="font-medium mb-4">Budget: {opp.budget}</p>
            <button className="btn btn-primary w-full" onClick={() => handleApply(opp.id)}>Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProOpportunities;
