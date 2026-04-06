export {
  getAvailableCategories,
  getFlowChoices,
  getNextQuestion,
  getFlowResult,
  startFlow,
  answerQuestion,
  skipQuestion,
  isUserAuthenticated,
  type FlowSession,
  type FlowQuestion,
  type FlowResult,
} from './flow-skeleton';
export {
  distanceRules,
  getRecentQuestionHistory,
  buildHistoryIndex,
  applyDistanceFilters,
  HISTORY_LIMIT,
  type RecentQuestionEntry,
  type HistoryIndex,
  type CandidateQuestion,
} from './distanceRules';