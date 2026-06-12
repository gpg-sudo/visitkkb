import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

/**
 * Get an API key by name (decrypted)
 * Checks database first, then falls back to environment variables
 */
export async function getApiKey(name: string): Promise<string | null> {
    try {
        // Try to get from database first
        const apiKey = await prisma.apiKey.findUnique({
            where: { name, isActive: true },
        });

        if (apiKey) {
            return decrypt(apiKey.encryptedValue);
        }

        // Fallback to environment variable
        const envValue = process.env[name];
        return envValue || null;
    } catch (error) {
        console.error(`Error getting API key ${name}:`, error);
        // Fallback to environment variable on error
        return process.env[name] || null;
    }
}

/**
 * Set an API key (encrypted storage)
 */
export async function setApiKey(
    name: string,
    value: string,
    description?: string,
    createdBy?: string
): Promise<void> {
    const encryptedValue = encrypt(value);

    await prisma.apiKey.upsert({
        where: { name },
        create: {
            name,
            encryptedValue,
            description,
            createdBy,
            isActive: true,
        },
        update: {
            encryptedValue,
            description,
            updatedAt: new Date(),
        },
    });
}

/**
 * Delete an API key
 */
export async function deleteApiKey(name: string): Promise<void> {
    await prisma.apiKey.delete({
        where: { name },
    });
}

/**
 * List all API keys (without decrypted values)
 */
export async function listApiKeys() {
    return await prisma.apiKey.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Toggle API key active status
 */
export async function toggleApiKeyStatus(name: string, isActive: boolean): Promise<void> {
    await prisma.apiKey.update({
        where: { name },
        data: { isActive },
    });
}
