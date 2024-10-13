import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";
import Loading from "../components/Loading";

// Define the shape of the context state
interface LoadingContextType {
    incrementLoading: () => void;
    decrementLoading: () => void;
    isLoading: boolean;
}

// Create a Loading Context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Create a custom hook to use the Loading Context
export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

// Create a Loading Provider
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [loadingCount, setLoadingCount] = useState<number>(0);

    const incrementLoading = useCallback(() => {
        setLoadingCount((prevCount) => prevCount + 1);
    }, []);

    const decrementLoading = useCallback(() => {
        setLoadingCount((prevCount) => Math.max(prevCount - 1, 0));
    }, []);

    const isLoading = loadingCount > 0;

    return (
        <LoadingContext.Provider
            value={{ incrementLoading, decrementLoading, isLoading }}
        >
            {children}
            {isLoading && <Loading />}
            {/* Render your loading indicator here */}
        </LoadingContext.Provider>
    );
};
