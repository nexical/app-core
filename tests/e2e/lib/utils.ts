
export class TestUtils {
    /**
     * Generates a unique string using a prefix, timestamp, and random component.
     */
    static uniqueString(prefix: string = 'test'): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Generates a unique email address.
     */
    static uniqueEmail(prefix: string = 'user'): string {
        return `${this.uniqueString(prefix)}@example.com`;
    }

    /**
     * Generates a unique username (alphanumeric and underscores).
     */
    static uniqueUsername(prefix: string = 'user'): string {
        return this.uniqueString(prefix).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }
}
