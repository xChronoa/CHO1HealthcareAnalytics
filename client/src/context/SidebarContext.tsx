import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface SidebarContextProps {
    isMinimized: boolean;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebarContext = (): SidebarContextProps => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebarContext must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMinimized, setIsMinimized] = useState(window.innerWidth < 1024);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
    const [prevMinimizedState, setPrevMinimizedState] = useState(window.innerWidth < 1024);
    const location = useLocation();

    const toggleSidebar = useCallback(() => {
        setIsMinimized((prevState) => {
            let newState = !prevState;
            setPrevMinimizedState(newState);
            return newState;
        });
    }, []);

    const collapseSidebar = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    const handleResize = useCallback(() => {
        if (window.innerWidth < 1024) {
            setIsMinimized(false);
            if (isCollapsed) {
                setIsCollapsed(true);
            }
        } else {
            setIsMinimized(prevMinimizedState);
            setIsCollapsed(false);
        }
    }, [isCollapsed, prevMinimizedState]);

    useEffect(() => {
        setIsCollapsed(true); // Collapse sidebar on route change
    }, [location]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return (
        <SidebarContext.Provider value={{ isMinimized, isCollapsed, toggleSidebar, collapseSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};
