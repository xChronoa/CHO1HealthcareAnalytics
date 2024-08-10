import { useCallback, useEffect, useState } from "react";

function useSidebar() {
    // Determines sidebar state
    const [isMinimized, setIsMinimized] = useState(window.innerWidth < 1024);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [prevMinimizedState, setPrevMinimizedState] = useState(window.innerWidth < 1024);

    // Minimizes or maximizes sidebar
    const toggleSidebar = useCallback(() => {
        setIsMinimized((prevState) => {
            let newState = !prevState;
            setPrevMinimizedState(newState);
            return newState;
        })
    }, []);

    // Show or hide sidebar
    const collapseSidebar = useCallback(() => {
        setIsCollapsed((prev) => !prev)
    }, []);

    // Check for change in screen size then change state
    const handleResize = useCallback(() => {
        if (window.innerWidth < 1024) {
            setIsMinimized(false)

            if(isCollapsed) {
                setIsCollapsed(true);
            }
        } else {
            setIsMinimized(prevMinimizedState);
            setIsCollapsed(false);
        }
    }, [isCollapsed, prevMinimizedState]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return { isMinimized, isCollapsed, toggleSidebar, collapseSidebar };
}

export default useSidebar;
