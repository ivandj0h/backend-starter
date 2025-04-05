/**
 * Standard response messages used across the application.
 */

export const RESPONSE_MESSAGES = {

    // AUTH
    USER_LOGGED_IN: 'User logged in',
    NO_TOKEN_PROVIDED: 'No token provided',
    INVALID_TOKEN: 'Invalid token',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_INACTIVE: 'User is inactive, please contact the administrator',
    USER_LOGGED_OUT: 'User logged out',

    // USERS
    USERS_FETCHED: 'Users fetched successfully',
    USER_FETCHED: 'User fetched successfully',
    USER_NOT_FOUND: 'User not found',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    PROFILE_FETCHED: 'Profile fetched successfully',

    // COMPANY
    COMPANIES_FETCHED: 'Companies fetched successfully',
    COMPANY_FETCHED: 'Company fetched successfully',
    COMPANY_NOT_FOUND: 'Company not found',
    COMPANY_CREATED: 'Company created successfully',
    COMPANY_UPDATED: 'Company updated successfully',
    COMPANY_DELETED: 'Company deleted successfully',
    COMPANY_STATUS_UPDATED: 'Company status updated successfully',

    ERROR: 'An error occurred',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_RUNNING: 'Recruitment Agent Backend API is running smoothly!',
};

/**
 * Standard HTTP status codes.
 */
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Console output messages used when starting services or debugging.
 */
export const CONSOLE_MESSAGES = {
    SERVER_RUNNING: '🚀 Server Running on Port :'
};

/**
 * Predefined log messages for application flow tracing.
 */
export const LOG_MESSAGES = {
    FETCH_USERS: 'Fetching users from repository',
    ERROR_FETCH_USERS: 'Error occurred while fetching users',
    FETCH_COMPANIES: 'Fetching companies from repository',
    ERROR_FETCH_COMPANIES: 'Error occurred while fetching companies'
};
