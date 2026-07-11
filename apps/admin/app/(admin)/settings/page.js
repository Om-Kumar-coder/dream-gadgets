import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { SettingsPageContent } from './settings-content';
export default function SettingsPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "animate-pulse", children: "Loading settings..." }), children: _jsx(SettingsPageContent, {}) }));
}
//# sourceMappingURL=page.js.map