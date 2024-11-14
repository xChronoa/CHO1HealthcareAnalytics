import Swal from "sweetalert2";

// Global fetch override
const originalFetch = window.fetch;

const fetchOverride = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    // Define routes where the fetch override should be active
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

        // Handle 401 Unauthorized and redirect, but not if already on a login page
        if (
            response.status === 401 &&
            currentPath !== "/barangay/login" &&
            currentPath !== "/admin/login"
        ) {
            const loginPath = currentPath.startsWith("/barangay") 
                ? "/barangay/login" 
                : "/admin/login"; // Defaults to admin login if not "barangay"
            
            window.location.href = loginPath;

            return Promise.reject(new Error("Unauthenticated: Redirecting to login."));
        }

        return response;
    } catch (error) {
        console.error("Fetch error:", error);

        // Handle network errors or other general fetch errors
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            // Display a user-friendly error message with SweetAlert
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Unable to connect. Please check your internet connection and try again.",
                confirmButtonText: "Retry"
            }).then(() => {
                // Optional: Retry the request
                fetchOverride(input, init).catch(retryError => {
                    console.error("Retry failed:", retryError);
                    Swal.fire({
                        icon: "error",
                        title: "Connection Failed",
                        text: "The network seems to be down. Please try again later.",
                        confirmButtonText: "Close"
                    });
                });
            });
        } else {
            // Generic error handling for non-network errors
            Swal.fire({
                icon: "error",
                title: "An Error Occurred",
                text: "Something went wrong. Please try again later.",
                confirmButtonText: "Close"
            });
        }

        return Promise.reject(error);
    }
};

// Reassign the global fetch
window.fetch = fetchOverride;
