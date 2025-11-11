import { ParamsOf } from './../../.next/types/routes.d';
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5050",
});

api.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        return config;
    },
    (error) => Promise.reject(error)
);


/**
 * Custom Error Class for better error handling (optional but recommended)
 */
export class ApiError extends Error {
    status: number | undefined;
    details: any;

    constructor(message: string, status?: number, details?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}
/**
 * Axios error handler function
 */
const handleError = (error: any): ApiError => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("API Error Response:", error.response.data);
        const data = error.response.data as any; // Type assertion
        return new ApiError(
            data?.message || error.message || "An API error occurred",
            error.response.status,
            data
        );
    } else if (error.request) {
        // The request was made but no response was received
        console.error("API No Response Error:", error.request);
        return new ApiError("No response received from server.", undefined, error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error("API Request Setup Error:", error.message);
        return new ApiError(error.message || "Error setting up API request.", undefined, error);
    }
};
export const apiFunctions = { // Renamed to avoid conflict with axios instance name 'api'

    // === Auth Calls ===
    requestPasswordReset: async (email: string, redirectTo: string) => {
        try {
            const response = await api.post('/api/auth/forgot-password', { email, redirectTo });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    resetPasswordWithToken: async (token: string, newPassword: string) => {
        try {
            const response = await api.post('/api/auth/reset-password', { token, password: newPassword });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Template Calls ===
    getTemplates: async () => {
        try {
            const response = await api.get('/api/templates');
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    createTemplate: async (templateData: any) => {
        try {
            const response = await api.post('/api/templates', templateData);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getTemplate: async (id: string) => {
        try {
            const response = await api.get(`/api/templates/${id}`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    updateTemplate: async (id: string, templateData: any) => {
        try {
            const response = await api.put(`/api/templates/${id}`, templateData);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    deleteTemplate: async (id: string) => {
        try {
            const response = await api.delete(`/api/templates/${id}`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Book Calls ===
    getBooks: async (params: URLSearchParams) => {
        try {
            // Axios handles params object directly
            const response = await api.get('/api/books', { params: Object.fromEntries(params) });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    deleteBooks: async (bookIds: string[]) => {
        try {
            // Axios 'delete' method can take a 'data' option for the body
            const response = await api.delete('/api/books/bulk', { data: { bookIds } });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getBookDetails: async (bookId: string) => {
        try {
            const response = await api.get(`/api/books/${bookId}/details`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getBookPricing: async (bookId: string) => {
        try {
            const response = await api.get(`/api/books/${bookId}/pricing`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    markAsOutOfPrint: async (bookId: string) => {
        try {
            const response = await api.put(`/api/books/${bookId}/outOfPrint`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getBookSuggestions: async (query: string) => {
        try {
            const response = await api.get('/api/books/suggestions', { params: { q: query } });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getPublisherSuggestions: async (query: string) => {
        try {
            const response = await api.get('/api/publisher-suggestions', { params: { q: query } });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    updateBook: async (bookId: string, data: { bookData: any; pricingData: any }) => {
        try {
            const response = await api.put(`/api/books/${bookId}`, data);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    checkBookDuplicate: async (data: { bookData: any; pricingData: any; publisherData: any }) => {
        try {
            const response = await api.post('/api/books/check-duplicate', data);
            return { data: response.data, statusCode: response.status };
        } catch (error) {
            throw handleError(error);
        }
    },

    createBook: async (payload: any) => {
        try {
            const response = await api.post('/api/books', payload);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Excel Import Calls ===
    // Note: Axios automatically sets Content-Type for FormData
    validateExcel: async (formData: FormData) => {
        try {
            const response = await api.post('/api/books/validate-excel', formData);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    importExcel: async (formData: FormData) => {
        try {
            const response = await api.post('/api/books/bulk-import', formData);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Email Calls ===
    getEmails: async () => {
        try {
            const response = await api.get('/api/emails');
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    updateEmailStatus: async (emailUid: string, status: string) => {
        try {
            const response = await api.patch(`/api/emails/${emailUid}/status`, { status });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getEmailDetail: async (id: string) => {
        try {
            const response = await api.get(`/api/emails/${id}`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Special File Download ===
    downloadEmailAttachment: async (id: string, filename: string): Promise<Blob> => {
        try {
            // Try Google API endpoint first (for Gmail API), fallback to IMAP endpoint
            try {
                const response = await api.get(`/api/google/emails/${id}/attachments/${encodeURIComponent(filename)}`, {
                    responseType: 'blob', // Tell axios to expect binary data
                });
                return response.data; // The data is already a Blob
            } catch (googleError) {
                // Fallback to IMAP endpoint if Google API fails
                const response = await api.get(`/api/emails/${id}/attachments/${encodeURIComponent(filename)}`, {
                    responseType: 'blob', // Tell axios to expect binary data
                });
                return response.data; // The data is already a Blob
            }
        } catch (error) { throw handleError(error); }
    },

    sendEmail: async (formData: FormData) => {
        try {
            const response = await api.post('/api/emails/send', formData);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // === Management Calls ===
    addCustomer: async (payload: any) => {
        try {
            const response = await api.post('/api/addCustomer', payload);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    addPublisher: async (payload: any) => {
        try {
            const response = await api.post('/api/addPublisher', payload);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // ==== Google email api call ====
    authGoogle: async () => {
        try {
            const response = await api.get('/api/google/auth-url');
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getGoogleEmail: async (search?: string) => {
        try {
            const params = search ? { search } : {};
            const response = await api.get('/api/google/emails', { params });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getGoogleEmailDetail: async (id: string) => {
        try {
            const response = await api.get(`/api/google/email`, { params: { messageId: id } });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // quotation
    getQuotationPreview: async (bookIds: string[]) => {
        try {
            const response = await api.post('/api/quotations/preview', { bookIds });
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    createQuotation: async (payload: any) => {
        try {
            const response = await api.post('/api/quotations/create', payload);
            console.log("resposnse ---------------- ", response);

            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getQuotation: async () => {
        try {
            const response = await api.get(`/api/quotations/`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getQuotationById: async (id: string) => {
        try {
            const response = await api.get(`/api/quotations/${id}`);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    downloadQuotationPDF: async (quotationId: string, selectedProfileId: string): Promise<Blob> => {
        try {
            const response = await api.get(`/api/quotations/${quotationId}/download?profileId=${selectedProfileId}`, {
                responseType: 'blob', // Tell axios to expect binary data
            });
            return response.data; // The data is already a Blob
        } catch (error) { throw handleError(error); }
    },

    updateQuotation: async (id: string, payload: any) => {
        try {
            const response = await api.put(`/api/quotations/${id}`, payload);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    // company profile
    createCompanyProfile: async (payload: any) => {
        try {
            const response = await api.post('/api/company-profiles', payload);
            return response.data;
        } catch (error) { throw handleError(error); }
    },

    getCompanyProfiles: async () => {
        try {
            const response = await api.get('/api/company-profiles');
            return response.data;
        } catch (error) { throw handleError(error); }
    },
};