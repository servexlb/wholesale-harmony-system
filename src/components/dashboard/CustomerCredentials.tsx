import React from 'react';

const CustomerCredentials = () => {
  // Dummy data for demonstration
  const credentials = {
    email: 'customer@example.com',
    password: 'securePassword',
    username: 'customer123',
    notes: 'This is a sample credential set.'
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Credentials</h1>
      
      {credentials ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Access Details</h2>
          
          {credentials.email && (
            <div className="mb-2">
              <span className="font-medium">Email:</span>
              <p>{credentials.email}</p>
            </div>
          )}
          
          {credentials.password && (
            <div className="mb-2">
              <span className="font-medium">Password:</span>
              <p>{credentials.password}</p>
            </div>
          )}
          
          {credentials.username && (
            <div className="mb-2">
              <span className="font-medium">Username:</span>
              <p>{credentials.username}</p>
            </div>
          )}
          
          {credentials.notes && (
            <div>
              <span className="font-medium">Notes:</span>
              <p>{credentials.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <p>No credentials available.</p>
      )}
    </div>
  );
};

export default CustomerCredentials;
