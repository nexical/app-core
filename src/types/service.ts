export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    total?: number;
    // Optional status code for specific HTTP errors if needed by consumers
    status?: number;
}
