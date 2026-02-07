'use client';

import React from 'react';
import UserProfile from '@modules/user-ui/src/registry/header-end/20-user-menu';

// Wrapper to reuse the UserProfile component in the mobile bottom zone
export default function MobileUserMenu() {
  return (
    <div className="flex items-center justify-center">
      <UserProfile />
    </div>
  );
}
