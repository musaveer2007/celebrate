import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container mt-8 text-center">
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
        AI-Powered Operating System for the Event Industry
      </h1>
      <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
        Connects Clients, Event Planners, and Professionals inside one premium ecosystem.
      </p>
      
      <div className="flex justify-center gap-4 mb-12">
        <Link to="/register" className="btn btn-primary text-lg px-8 py-3">Get Started</Link>
      </div>

      <div className="flex justify-center gap-8">
        <div className="card w-1/3 text-left">
          <h2 className="text-2xl font-bold mb-2">For Clients</h2>
          <p className="text-slate-600 mb-4">Post your event requirements, get matched with the perfect planners, and review stunning AI-generated proposals.</p>
        </div>
        <div className="card w-1/3 text-left">
          <h2 className="text-2xl font-bold mb-2">For Planners</h2>
          <p className="text-slate-600 mb-4">Receive qualified leads, generate visual proposals with AI, and manage your entire event timeline and team in one workspace.</p>
        </div>
        <div className="card w-1/3 text-left">
          <h2 className="text-2xl font-bold mb-2">For Professionals</h2>
          <p className="text-slate-600 mb-4">Discover structured work opportunities, apply for projects, and coordinate seamlessly with event planners.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
