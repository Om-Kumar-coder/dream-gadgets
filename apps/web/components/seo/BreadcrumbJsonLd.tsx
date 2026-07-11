import { JsonLd } from './JsonLd';

interface Crumb {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
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

  return <JsonLd data={schema} />;
}
