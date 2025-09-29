
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('@prisma/client/runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  phone: 'phone',
  language: 'language',
  country: 'country',
  dateOfBirth: 'dateOfBirth',
  avatarUrl: 'avatarUrl',
  motto: 'motto',
  theme: 'theme',
  funds: 'funds',
  diamonds: 'diamonds',
  xp: 'xp',
  level: 'level',
  lastLoginAt: 'lastLoginAt',
  lastActiveAt: 'lastActiveAt',
  createdAt: 'createdAt',
  image: 'image'
};

exports.Prisma.OrgScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.MembershipScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  orgId: 'orgId',
  role: 'role'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  createdById: 'createdById',
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  source: 'source',
  assigneeType: 'assigneeType',
  assigneeId: 'assigneeId',
  dueAt: 'dueAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  name: 'name',
  url: 'url',
  mimeType: 'mimeType',
  size: 'size'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  authorType: 'authorType',
  text: 'text',
  createdAt: 'createdAt'
};

exports.Prisma.WorkflowScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  name: 'name',
  trigger: 'trigger',
  action: 'action',
  keywords: 'keywords',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RunScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  workflowId: 'workflowId',
  status: 'status',
  logs: 'logs',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  type: 'type',
  config: 'config',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  subCategoryId: 'subCategoryId',
  subSubCategoryId: 'subSubCategoryId',
  relatedToId: 'relatedToId',
  metadata: 'metadata',
  currentVersionId: 'currentVersionId'
};

exports.Prisma.QuestionVersionScalarFieldEnum = {
  id: 'id',
  questionId: 'questionId',
  text: 'text',
  displayText: 'displayText',
  type: 'type',
  options: 'options',
  metadata: 'metadata',
  createdAt: 'createdAt',
  version: 'version'
};

exports.Prisma.QuestionTagScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.QuestionVersionTagScalarFieldEnum = {
  id: 'id',
  questionVersionId: 'questionVersionId',
  tagId: 'tagId'
};

exports.Prisma.FlowScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  metadata: 'metadata'
};

exports.Prisma.FlowStepScalarFieldEnum = {
  id: 'id',
  flowId: 'flowId',
  questionVersionId: 'questionVersionId',
  order: 'order',
  section: 'section',
  branchCondition: 'branchCondition',
  randomGroup: 'randomGroup',
  isOptional: 'isOptional',
  metadata: 'metadata'
};

exports.Prisma.FlowStepLinkScalarFieldEnum = {
  id: 'id',
  fromStepId: 'fromStepId',
  toStepId: 'toStepId',
  condition: 'condition'
};

exports.Prisma.FlowProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  flowId: 'flowId',
  currentStepId: 'currentStepId',
  startedAt: 'startedAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AnswerScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  stepId: 'stepId',
  questionVersionId: 'questionVersionId',
  value: 'value',
  createdAt: 'createdAt'
};

exports.Prisma.LanguageScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name'
};

exports.Prisma.VersionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  value: 'value',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.TaskStatus = exports.$Enums.TaskStatus = {
  NEW: 'NEW',
  ROUTED: 'ROUTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED'
};

exports.TaskSource = exports.$Enums.TaskSource = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  API: 'API'
};

exports.AssigneeType = exports.$Enums.AssigneeType = {
  AUTO: 'AUTO',
  VA: 'VA'
};

exports.AuthorType = exports.$Enums.AuthorType = {
  USER: 'USER',
  VA: 'VA',
  SYSTEM: 'SYSTEM'
};

exports.WorkflowTrigger = exports.$Enums.WorkflowTrigger = {
  KEYWORD: 'KEYWORD',
  FORM: 'FORM',
  API: 'API'
};

exports.WorkflowAction = exports.$Enums.WorkflowAction = {
  GOOGLE_SEARCH: 'GOOGLE_SEARCH',
  WEB_SCRAPE: 'WEB_SCRAPE',
  DOC_SUMMARY: 'DOC_SUMMARY',
  CUSTOM: 'CUSTOM'
};

exports.RunStatus = exports.$Enums.RunStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED'
};

exports.IntegrationType = exports.$Enums.IntegrationType = {
  GMAIL: 'GMAIL',
  SLACK: 'SLACK',
  WEBHOOK: 'WEBHOOK'
};

exports.Prisma.ModelName = {
  User: 'User',
  Org: 'Org',
  Membership: 'Membership',
  Task: 'Task',
  Attachment: 'Attachment',
  Message: 'Message',
  Workflow: 'Workflow',
  Run: 'Run',
  Integration: 'Integration',
  Question: 'Question',
  QuestionVersion: 'QuestionVersion',
  QuestionTag: 'QuestionTag',
  QuestionVersionTag: 'QuestionVersionTag',
  Flow: 'Flow',
  FlowStep: 'FlowStep',
  FlowStepLink: 'FlowStepLink',
  FlowProgress: 'FlowProgress',
  Answer: 'Answer',
  Language: 'Language',
  Version: 'Version'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
