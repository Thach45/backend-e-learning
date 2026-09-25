import React from 'react';

const InstructorPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1>Instructor Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">Total Students</div>
        <div className="stat-card">Total Revenue</div>
        <div className="stat-card">Course Rating</div>
      </div>
      <div className="placeholder-box">
        Instructor Tools Placeholder (Create Course, Analytics)
      </div>
    </div>
  );
};

export default InstructorPage;

