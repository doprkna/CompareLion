export const CATEGORY_RULES = {
  violence: ['blood', 'weapon', 'fight'],
  adult: ['nudity', 'adult', 'sensual'],
  drugs: ['smoke', 'pills', 'drug'],
  scary: ['monster', 'ghost', 'horror'],
};

export type Category = keyof typeof CATEGORY_RULES;

