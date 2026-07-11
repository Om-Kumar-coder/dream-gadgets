interface CustomerDetailsProps {
    data: {
        customerName: string;
        phone: string;
        email: string;
    };
    onUpdate: (data: Partial<{
        customerName: string;
        phone: string;
        email: string;
    }>) => void;
}
export declare function CustomerDetails({ data, onUpdate }: CustomerDetailsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CustomerDetails.d.ts.map