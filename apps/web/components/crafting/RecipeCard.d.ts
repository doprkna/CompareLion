import { Recipe } from '@parel/core/hooks/useRecipes';
interface RecipeCardProps {
    recipe: Recipe;
    userInventory: Record<string, number>;
    onCraftSuccess?: () => void;
}
export declare function RecipeCard({ recipe, userInventory, onCraftSuccess }: RecipeCardProps): import("react").JSX.Element;
export {};
