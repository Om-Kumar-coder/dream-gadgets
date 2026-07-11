declare const _default: (() => {
    env: "development" | "production" | "test";
    port: number;
    webUrl: string;
    adminUrl: string;
    jwtSecret: string;
    jwtExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    cdnBaseUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: "development" | "production" | "test";
    port: number;
    webUrl: string;
    adminUrl: string;
    jwtSecret: string;
    jwtExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
    cdnBaseUrl: string;
}>;
export default _default;
//# sourceMappingURL=app.config.d.ts.map