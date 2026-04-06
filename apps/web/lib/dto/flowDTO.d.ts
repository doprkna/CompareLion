import type { FlowProgress as PrismaFlowProgress } from '@parel/db';
export declare function toFlowDTO(f: PrismaFlowProgress & {
    flow?: {
        name?: string;
    };
}): {
    id: string;
    userId: string;
    type: string;
    state: string;
    createdAt: Date;
};
export type FlowDTO = ReturnType<typeof toFlowDTO>;
