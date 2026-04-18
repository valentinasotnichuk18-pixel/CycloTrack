import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="px-5 pb-4" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
