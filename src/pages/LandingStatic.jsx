import React from 'react';

export default function LandingStatic() {
  React.useEffect(() => {
    window.location.replace('/landing/index.html');
  }, []);
  return null;
}
