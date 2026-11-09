'use client';

import React from 'react';
import AdminAuditLogTable from '@/components/system/AdminAuditLogTable';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <AdminAuditLogTable />
    </div>
  );
}

