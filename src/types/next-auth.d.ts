import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session extends DefaultSession {
        /** JWT access token */
        accessToken?: string;
        /** User information */
        user: {
            /** User's email address */
            email: string;
            /** User's display name */
            name?: string;
            /** User's avatar image URL */
            image?: string;
        } & DefaultSession['user']
    }

    /**
     * User information interface
     */
    interface User {
        /** JWT access token */
        accessToken?: string;
    }

    /**
     * JWT token interface
     */
    interface JWT {
        /** JWT access token */
        accessToken?: string;
    }
}
