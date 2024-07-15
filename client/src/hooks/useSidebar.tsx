import { useCallback, useEffect, useState } from "react";

function useSidebar() {
    // Determines sidebar state
    const [isMinimized, setIsMinimized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);

    // Minimizes or maximizes sidebar
    const toggleSidebar = useCallback(() => {
        setIsMinimized((prev) => !prev);
    }, []);

    // Show or hide sidebar
    const collapseSidebar = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    // Check for change in screen size then change state
    const handleResize = useCallback(() => {
        if (window.innerWidth < 1024) {
            setIsCollapsed(isCollapsed);
            setIsMinimized(false)
        } else {
            setIsCollapsed(!isCollapsed);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);

        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return { isMinimized, isCollapsed, toggleSidebar, collapseSidebar };
}

export default useSidebar;
