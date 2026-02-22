'use client'

import React from 'react';

const ErrorPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Oops! Something went wrong.</h1>
      <p>We are sorry, but an unexpected error occurred.</p>
      <p>Please try again later.</p>
    </div>
  );
};

export default ErrorPage;