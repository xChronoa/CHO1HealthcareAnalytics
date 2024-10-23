// Global fetch override
const originalFetch = window.fetch;

const fetchOverride = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    try {
        const response = await originalFetch(input, {
            credentials: "include", // Default to include credentials
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...init.headers, // Merge custom headers
            },
            ...init, // Allow overriding
        });

        // Handle 401 Unauthorized and redirect
        if (response.status === 401 && !/\/(admin|barangay)\/login/.test(window.location.pathname)) {
            const loginPath = window.location.pathname.startsWith("/admin") 
                ? "/admin/login" 
                : "/barangay/login";
            window.location.href = loginPath;
            return Promise.reject(new Error("Unauthenticated: Redirecting to login."));
        }

        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        return Promise.reject(error);
    }
};

// Reassign the global fetch
window.fetch = fetchOverride;