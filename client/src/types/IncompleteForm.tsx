type IncompleteData = {
    M1: string[];
    M2: string[];
};

type IncompleteUpdate = (source: keyof IncompleteData, incomplete: string[]) => void;

export type { IncompleteData, IncompleteUpdate };