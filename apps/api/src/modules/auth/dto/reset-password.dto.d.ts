export declare class ForgotPasswordDto {
    identifier: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=reset-password.dto.d.ts.map