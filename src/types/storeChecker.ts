import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type StoreChecker = {
    id: number;
    name: string;
    image: string;
    verified: boolean;
    trustLevel: string;
}

export type Step = {
    id: number;
    title: string;
    description: string;
}

export type SafetyLevel = {
    id: number;
    title: string;
    description: string;
    icon: IconDefinition;
    color: string;
    borderColor: string;
    textColor: string;
}

