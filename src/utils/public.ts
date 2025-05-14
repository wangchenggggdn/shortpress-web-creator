import { v4 as uuidv4 } from 'uuid'; // Import the v4 (random) UUID generator

/**
 * Generates a unique ID (using UUID v4) that does not exist in the provided set of existing IDs.
 * @param existingIds A Set or array of already existing IDs. Using a Set is recommended.
 * @returns A new UUID that is not present in `existingIds`.
 */
export function createUniqueUUID(
    existingIds: Set<string> | string[]
): string {
    const existingIdSet = Array.isArray(existingIds) ? new Set(existingIds) : existingIds;
    let newId: string;

    // UUID v4 collisions are extremely rare, but we check for absolute safety.
    // In almost all cases, this loop will execute only once.
    do {
        newId = uuidv4();
    } while (existingIdSet.has(newId));

    return newId;
}