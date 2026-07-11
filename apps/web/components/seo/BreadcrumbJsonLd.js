import { jsx as _jsx } from "react/jsx-runtime";
import { JsonLd } from './JsonLd';
export function BreadcrumbJsonLd({ items }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreamgadgets.in'}${item.url}`,
        })),
    };
    return _jsx(JsonLd, { data: schema });
}
//# sourceMappingURL=BreadcrumbJsonLd.js.map