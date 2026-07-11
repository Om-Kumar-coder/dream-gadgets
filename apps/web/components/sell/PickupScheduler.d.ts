interface PickupSchedulerProps {
    data: {
        pickupDate: string;
        pickupTime: string;
        address: string;
        city: string;
        pincode: string;
    };
    onUpdate: (data: Partial<{
        pickupDate: string;
        pickupTime: string;
        address: string;
        city: string;
        pincode: string;
    }>) => void;
}
export declare function PickupScheduler({ data, onUpdate }: PickupSchedulerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PickupScheduler.d.ts.map