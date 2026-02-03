/**
 * Landing Flow Smoke Tests
 * v0.15.1 - Tests for new landing page routing logic
 *
 * Scenarios:
 * 1. Guest user lands on /landing with sign-in CTA
 * 2. Logged-in user lands on /landing with "Continue" button
 * 3. Toggle on → redirects to /main on next login
 * 4. Toggle off → stays on /landing
 * 5. No route loops or hydration issues
 */
export declare const landingFlowHelpers: {
    /**
     * Simulate guest user landing flow
     */
    testGuestFlow(): Promise<{
        success: boolean;
        landedOn: string;
        hasSignInButton: boolean;
        hasSignUpButton: boolean;
    }>;
    /**
     * Simulate logged-in user landing flow
     */
    testLoggedInFlow(skipLanding: boolean): Promise<{
        success: boolean;
        skipLanding: boolean;
        finalRoute: string;
        hasContinueButton: boolean;
    }>;
    /**
     * Test toggle functionality
     */
    testToggle(): Promise<{
        success: boolean;
        value: string | null;
    }>;
};
