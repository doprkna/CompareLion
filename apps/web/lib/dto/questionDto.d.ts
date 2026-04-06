import { FlowQuestionSchema } from '@parel/db/generated';
import { z } from 'zod';
export type QuestionDTO = z.infer<typeof FlowQuestionSchema>;
export declare function toQuestionDTO(q: unknown): QuestionDTO;
export declare function toQuestionDTOSafe(q: unknown): z.ZodSafeParseResult<{
    type: "SINGLE_CHOICE" | "MULTI_CHOICE" | "TEXT" | "RANGE" | "NUMBER";
    id: string;
    categoryId: string | null;
    locale: string;
    text: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
