import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Reusable JSON-LD structured data component.
 * Inject this on any page to add schema.org structured data.
 */
export function JsonLd({ data }) {
    const items = Array.isArray(data) ? data : [data];
    return (_jsx(_Fragment, { children: items.map((item, i) => (_jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(item) } }, i))) }));
}
//# sourceMappingURL=JsonLd.js.map