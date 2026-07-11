import { Branch, User } from '../../auth/entities/user.entity';
export declare class Client {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    alternatePhone: string | null;
    email: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    gstin: string | null;
    idProofType: string | null;
    idProofNumber: string | null;
    ekycStatus: string;
    ekycVerifiedAt: Date | null;
    ekycVerifiedBy: User;
    ekycVerifiedById: string | null;
    tags: object | null;
    ekycDocuments: object | null;
    customerType: string;
    isActive: boolean;
    birthdayOffer: boolean;
    notes: string | null;
    createdBy: User;
    createdById: string;
    branch: Branch;
    branchId: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=client.entity.d.ts.map