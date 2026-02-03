export type StorySchema = {
    id: string;
    title: string;
    content?: string;
};
export type ReactionSchema = {
    id: string;
    type: string;
    storyId: string;
};
export type UserSchema = {
    id: string;
    email: string;
    name?: string;
};
