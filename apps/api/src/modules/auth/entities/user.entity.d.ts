export declare class Role {
    id: string;
    name: string;
    description: string;
    isSystem: boolean;
    createdAt: Date;
}
export declare class Branch {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    pincode: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    instagram: string | null;
    workingHours: string | null;
    mapUrl: string | null;
    sortOrder: number | null;
    gstin: string | null;
    isActive: boolean;
    createdAt: Date;
}
export declare class User {
    id: string;
    email: string;
    phone: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: Role;
    roleId: string;
    branch: Branch;
    branchId: string;
    isActive: boolean;
    avatarUrl: string;
    walletBalance: number;
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.entity.d.ts.map