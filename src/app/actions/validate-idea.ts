'use server';

import { validateFeatureIdea } from "@/ai/flows/validateFeatureIdea";
import type { ValidateIdeaInput, ValidateIdeaOutput } from "@/ai/flows/validateFeatureIdea.types";

/**
 * A server action that wraps the validateFeatureIdea flow.
 * This allows client components to call it without directly importing a server-side flow.
 */
export async function validateIdeaAction(input: ValidateIdeaInput): Promise<ValidateIdeaOutput> {
    return await validateFeatureIdea(input);
}
