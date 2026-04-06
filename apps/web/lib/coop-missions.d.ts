/**
 * Cooperative Missions (v0.8.4)
 *
 * PLACEHOLDER: Shared question chains for friends.
 */
export declare function createCoopMission(_creatorId: string, _type: string, _questionIds: string[]): Promise<null>;
export declare function joinCoopMission(_missionId: string, _userId: string): Promise<null>;
export declare function submitCoopAnswer(_missionId: string, _userId: string, _questionId: string, _answer: string): Promise<null>;
export declare function checkMissionCompletion(_missionId: string): Promise<null>;
