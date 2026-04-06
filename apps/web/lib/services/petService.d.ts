/**
 * Pet Service
 * Pet/Companion system management
 * v0.36.32 - Companions & Pets 1.0
 */
export interface PetBonus {
    attack?: number;
    defense?: number;
    luck?: number;
    dodge?: number;
    critChance?: number;
    speed?: number;
}
export interface PetData {
    name: string;
    type: 'pet' | 'companion';
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'uncommon';
    bonus?: PetBonus;
    icon?: string;
    description?: string;
}
/**
 * MVP Pet Set - Seed data
 */
export declare const MVP_PETS: PetData[];
/**
 * Seed pets into database (idempotent)
 */
export declare function seedPets(): Promise<void>;
/**
 * Get user's pets with full pet data
 */
export declare function getUserPets(userId: string): Promise<any>;
/**
 * Get user's equipped companion
 */
export declare function getEquippedCompanion(userId: string): Promise<any>;
/**
 * Unlock a pet for a user (idempotent - prevents duplicates)
 */
export declare function unlockPet(userId: string, petId: string): Promise<string>;
/**
 * Equip a companion (unequips others automatically)
 */
export declare function equipCompanion(userId: string, userPetId: string): Promise<void>;
/**
 * Unequip companion
 */
export declare function unequipCompanion(userId: string, userPetId: string): Promise<void>;
/**
 * Grant XP to a pet
 */
export declare function grantPetXP(userPetId: string, xpAmount: number): Promise<{
    leveledUp: boolean;
    newLevel: number;
}>;
/**
 * Grant XP to all user's pets
 */
export declare function grantXPToAllUserPets(userId: string, xpAmount: number): Promise<void>;
/**
 * Set pet nickname
 */
export declare function renamePet(userId: string, userPetId: string, nickname: string | null): Promise<void>;
