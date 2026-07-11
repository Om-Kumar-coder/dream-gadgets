import type { Metadata } from 'next';
interface Props {
    params: {
        slug: string;
    };
    searchParams: Record<string, string>;
}
export declare function generateMetadata({ params }: Props): Promise<Metadata>;
export default function BrandPage({ params: { slug }, searchParams }: Props): Promise<import("react/jsx-runtime").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map