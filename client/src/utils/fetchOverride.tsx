// Global fetch override
const originalFetch = window.fetch;

const fetchOverride = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    // List of routes where the fetch override should be active
    const protectedRoutes = [
        "/barangay/login",
        "/admin/login",
        "/admin",
        "/admin/transactions",
        "/admin/barangays",
        "/admin/appointments",
        "/admin/manage",
        "/admin/report",
        "/barangay",
        "/barangay/history",
        "/barangay/report",
        "/barangay/report/submitted"
    ];
    
    // Get the current pathname
    const currentPath = window.location.pathname;
    
    // Check if the current route matches any protected route
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    // Only apply fetch override for protected routes
    if (!isProtectedRoute) {
        return originalFetch(input, init); // Bypass override if not in protected route
    }

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
        if (response.status === 401 && !/\/(admin|barangay)\/login/.test(currentPath)) {
            const loginPath = currentPath.startsWith("/barangay") 
                ? "/barangay/login" 
                : "/admin/login"; // Defaults to admin login if not "barangay"
            
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
