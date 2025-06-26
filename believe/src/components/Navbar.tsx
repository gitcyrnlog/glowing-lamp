import React from 'react';
import { Header } from './Header';

// This is a wrapper component that redirects to Header
// It's here for backward compatibility
export default function Navbar() {
  return <Header />;
}
