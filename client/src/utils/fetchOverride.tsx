import Swal from "sweetalert2";

// Global fetch override
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    // Define routes where the fetch override should be active
    const protectedRoutes = [
        "/admin/login",
        "/admin",
        "/admin/transactions",
        "/admin/barangays",
        "/admin/appointments",
        "/admin/manage",
        "/admin/manage/create",
        "/admin/manage/update",
        "/admin/manage/accounts",
        "/admin/report",

        "/barangay/login",
        "/barangay",
        "/barangay/history",
        "/barangay/report",
        "/barangay/report/submitted",
        "/barangay/edit/account"
    ];

    // Get the current pathname
    const currentPath = window.location.pathname;

    // Check if the current route matches any protected route
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    // If the route is protected and does not contain "report/submitted", handle it with custom logic
    if (isProtectedRoute && !currentPath.includes("report/submitted/")) {
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

            // Handle 401 Unauthorized and redirect if needed
            if (response.status === 401 && currentPath !== "/barangay/login" && currentPath !== "/admin/login") {
                const loginPath = currentPath.startsWith("/barangay") ? "/barangay/login" : "/admin/login"; // Defaults to admin login if not "barangay"
                window.location.href = loginPath;
                return Promise.reject(new Error("Unauthenticated: Redirecting to login."));
            }

            return response;
        } catch (error) {
            console.error("Fetch error:", error);

            // Handle network errors or other general fetch errors
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Unable to connect. Please check your internet connection and try again.",
                    confirmButtonText: "Retry"
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
    }

    // Fallback: if the route is not protected or includes "report/submitted", use the original fetch
    try {
        return await originalFetch(input, init); // First try to use the original fetch
    } catch (error) {
        // Handle network errors universally
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Unable to connect. Please check your internet connection and try again.",
                confirmButtonText: "Retry"
            });
        } else {
            // Generic error handling for other types of errors
            Swal.fire({
                icon: "error",
                title: "An Error Occurred",
                text: "Something went wrong. Please try again later.",
                confirmButtonText: "Close"
            });
        }
        return Promise.reject(error); // Reject the promise to propagate the error
    }
};