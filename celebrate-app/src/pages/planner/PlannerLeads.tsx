import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { matchService, proposalService } from '../../services/api';

const PlannerLeads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal state
  const [showModal, setShowModal] = useState(false);
  const [activeLead, setActiveLead] = useState<any>(null);
  const [exportedDesignUrl, setExportedDesignUrl] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    total_price: 10000
  });

  useEffect(() => {
    if (user) loadLeads();
  }, [user]);

  useEffect(() => {
    const handleStorage = () => {
      const design = localStorage.getItem('canvas_export');
      if (design && design !== exportedDesignUrl) {
        setExportedDesignUrl(design);
      }
    };
    
    if (showModal) {
      handleStorage();
      const interval = setInterval(handleStorage, 1000);
      window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
      };
    }
  }, [showModal, exportedDesignUrl]);

  const loadLeads = async () => {
    const data = await matchService.getPlannerLeads(user.id);
    setLeads(data);
    setLoading(false);
  };

  const handleCreateProposal = (lead: any) => {
    setActiveLead(lead);
    setProposalData({
      title: `Proposal for ${lead.events?.title}`,
      description: 'We would love to plan this event...',
      total_price: lead.events?.budget || 10000
    });
    setShowModal(true);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    await proposalService.createProposal({
      event_id: activeLead.event_id,
      planner_id: user.id,
      title: proposalData.title,
      description: proposalData.description,
      total_price: Number(proposalData.total_price),
      design_url: exportedDesignUrl || undefined
    });
    
    setShowModal(false);
    setExportedDesignUrl(null);
    localStorage.removeItem('canvas_export');
    loadLeads(); // refresh status
  };

  if (loading) return <div>Loading leads...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Matched Leads</h1>
      
      {leads.length === 0 ? (
        <div className="card text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No leads yet</h2>
          <p className="text-slate-500">When clients post events that match your profile, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map(lead => (
            <div key={lead.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{lead.events?.title}</h3>
                  <span className="badge badge-primary">{lead.match_score}% Match</span>
                </div>
                <p className="text-sm text-slate-500 mb-1">{new Date(lead.events?.date).toLocaleDateString()} • {lead.events?.location}</p>
                <p className="text-sm font-medium mb-4">Budget: ${lead.events?.budget}</p>
                <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 mb-4 line-clamp-3">
                  Client is looking for a {lead.events?.event_type} planner for {lead.events?.guest_count} guests.
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                {lead.status === 'new' ? (
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => handleCreateProposal(lead)}
                  >
                    Create Proposal
                  </button>
                ) : (
                  <button className="btn btn-secondary w-full" disabled>
                    Proposal Sent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Very basic modal for Proposal */}
      {showModal && activeLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create Proposal</h2>
            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Proposal Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={proposalData.title}
                  onChange={e => setProposalData({...proposalData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Price ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={proposalData.total_price}
                  onChange={e => setProposalData({...proposalData, total_price: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Concept</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  value={proposalData.description}
                  onChange={e => setProposalData({...proposalData, description: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md border border-purple-100 flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-900">AI Design Canvas</h4>
                    <p className="text-sm text-purple-700">Add visual renders to win this client</p>
                  </div>
                  <button type="button" className="btn btn-purple text-sm py-1 px-3" onClick={() => window.open('/planner/ai-canvas', '_blank')}>Open Canvas</button>
                </div>
                {exportedDesignUrl && (
                  <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start', borderRadius: '8px', overflow: 'hidden', border: '2px solid #d8b4fe', marginTop: '12px', backgroundColor: '#f3f4f6' }}>
                    <img src={exportedDesignUrl} alt="Exported Design" style={{ height: '140px', width: 'auto', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                      ✓ Attached
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setExportedDesignUrl(null);
                        localStorage.removeItem('canvas_export');
                      }}
                      style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      title="Remove attached design"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerLeads;
