const fs = require('fs');

const pages = [
  { file: 'apps/admin/app/(admin)/exchange/page.tsx', perm: 'exchange.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/orders/page.tsx', perm: 'orders.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/buyback/page.tsx', perm: 'buyback.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/price-guide/page.tsx', perm: 'inventory.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/returns/page.tsx', perm: 'returns.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/coupons/page.tsx', perm: 'sales.view', importLine: "import Link from 'next/link';" },
  { file: 'apps/admin/app/(admin)/emi/page.tsx', perm: 'sales.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/refunds/page.tsx', perm: 'sales.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/reports/page.tsx', perm: 'reports.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/gst/page.tsx', perm: 'financial.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/notifications/page.tsx', perm: 'notifications.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/users/page.tsx', perm: 'users.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/announcement-bar/page.tsx', perm: 'content.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/whatsapp/page.tsx', perm: 'whatsapp.view', importLine: "import { apiClient } from '@/lib/api';" },
  { file: 'apps/admin/app/(admin)/accessories/page.tsx', perm: 'inventory.view', importLine: "import { apiClient } from '@/lib/api';" },
];

// Simple wrapper pages (no 'use client', just component)
const simplePages = [
  { file: 'apps/admin/app/(admin)/brands/page.tsx', perm: 'branches.view' },
  { file: 'apps/admin/app/(admin)/banners/page.tsx', perm: 'banners.view' },
];

let fixed = 0;
let errors = 0;

function addGateToClientPage(filePath, perm, importLine) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has PermissionGate
  if (content.includes('PermissionGate')) {
    console.log('  SKIP (already has gate):', filePath);
    return;
  }
  
  // 1. Add import after the import line
  const importGate = "import { PermissionGate } from '@/components/auth/PermissionGate';";
  if (!content.includes(importGate)) {
    // Find the import line and add after it
    const importIdx = content.indexOf(importLine);
    if (importIdx === -1) {
      console.log('  ERROR: import line not found:', importLine);
      errors++;
      return;
    }
    const afterImport = content.indexOf('\n', importIdx) + 1;
    content = content.slice(0, afterImport) + importGate + '\n' + content.slice(afterImport);
  }
  
  // 2. Find the return statement's opening <div and wrap it
  // Look for the main return: "return (\n    <div" pattern
  const returnMatch = content.match(/(  return \(\n    <div[^>]*>)/);
  if (returnMatch) {
    const openTag = returnMatch[1];
    const replaceWith = openTag.replace('return (\n    <div', `return (\n    <PermissionGate permission="${perm}"><div`);
    content = content.replace(openTag, replaceWith);
    
    // Find the last </div> before );\n} and add </PermissionGate>
    const returnCloseIdx = content.lastIndexOf('  );\n}');
    if (returnCloseIdx > 0) {
      const beforeClose = content.slice(0, returnCloseIdx);
      const lastDiv = beforeClose.lastIndexOf('</div>');
      if (lastDiv > 0) {
        content = content.slice(0, lastDiv + 6) + '</PermissionGate>\n' + content.slice(lastDiv + 6);
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log('  FIXED:', filePath);
  } else {
    console.log('  ERROR: return pattern not found:', filePath);
    errors++;
  }
}

function addGateToSimplePage(filePath, perm) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('PermissionGate')) {
    console.log('  SKIP (already has gate):', filePath);
    return;
  }
  
  const importGate = "import { PermissionGate } from '@/components/auth/PermissionGate';";
  
  // Add import before the existing import
  content = importGate + '\n' + content;
  
  // Wrap the return: "return <XxxManager />" -> "return <PermissionGate perm><XxxManager /></PermissionGate>"
  content = content.replace(
    /(return\s+<)(\w+)/,
    `$1<PermissionGate permission="${perm}">$2`
  );
  content = content.replace(
    /(<\/\w+>\s*;)\s*}\s*$/,
    `$1</PermissionGate>\n}\n`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  fixed++;
  console.log('  FIXED (simple):', filePath);
}

console.log('Adding PermissionGate to client pages...');
for (const p of pages) {
  addGateToClientPage(p.file, p.perm, p.importLine);
}

console.log('\nAdding PermissionGate to simple pages...');
for (const p of simplePages) {
  addGateToSimplePage(p.file, p.perm);
}

console.log(`\nDone: ${fixed} fixed, ${errors} errors`);
