interface ForgotPasswordFormProps {
    /** Callback when the user wants to go back to the login form */
    onBack?: () => void;
    /** If true, renders a compact version without full-page layout, suitable for embedding */
    embedded?: boolean;
}
/**
 * Forgot Password form component with rate-limit cooldown.
 *
 * After sending a reset link, a cooldown timer prevents spam.
 * The cooldown is persisted in localStorage so it survives page refreshes.
 *
 * Can be used standalone (full-page layout) or embedded in another page
 * (e.g. the login page) by passing `embedded={true}`.
 */
export default function ForgotPasswordForm({ onBack, embedded }: ForgotPasswordFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ForgotPasswordForm.d.ts.map