export declare function toPingDTO(p: {
    status: 'ok';
    timestamp: Date;
    version: string;
}): {
    status: 'ok';
    timestamp: Date;
    version: string;
};
export type PingDTO = ReturnType<typeof toPingDTO>;
