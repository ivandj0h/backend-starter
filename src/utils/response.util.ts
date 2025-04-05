/**
 * ApiResponse<T>
 *
 * Tipe data standar untuk seluruh response API.
 * - status: 'success' atau 'error' untuk menunjukkan hasil eksekusi
 * - message: pesan yang menjelaskan hasil
 * - data: bisa berupa object, array, atau null (tergantung response)
 */
export type ApiResponse<T = any> = {
    status: 'success' | 'error';
    message: string;
    data: T | null;
};

/**
 * successResponse()
 *
 * Utility function untuk membuat response sukses.
 * - message: pesan sukses
 * - data: isi data (opsional), default: null
 * - return: ApiResponse<T> dengan status 'success'
 */
export function successResponse<T = any>(message: string, data: T | null = null): ApiResponse<T> {
    return {
        status: 'success',
        message,
        data
    };
}

/**
 * errorResponse()
 *
 * Utility function untuk membuat response error.
 * - message: pesan error
 * - data: detail error tambahan (opsional), default: null
 * - return: ApiResponse dengan status 'error'
 */
export function errorResponse(message: string, data: any = null): ApiResponse {
    return {
        status: 'error',
        message,
        data
    };
}
