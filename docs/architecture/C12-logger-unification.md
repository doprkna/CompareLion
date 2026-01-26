## C12 â€” Logger Unification

### Purpose

This document defines the plan for unifying logging across the Parel codebase. It provides a logging audit, unified logger goals, API blueprint, structured log format, scopes and namespaces, transport strategy, deprecation map, migration strategy, and risk map for structural planning.

---

# C12 â€” Logger Unification â€” Planning Document

## 1. Current Logging Audit

### Issue 1: Multiple Logger Utilities

**Problem:** Different modules use different logging utilities and implementations

**Impact:**
- Inconsistent logging behavior across codebase
- Different log formats in different modules
- Hard to maintain and update logging
- No unified logging strategy
- Difficult to aggregate and analyze logs

### Issue 2: Inconsistent Log Levels

**Problem:** Different modules use log levels differently, no standard level definitions

**Impact:**
- Unclear what each log level means
- Inconsistent verbosity across modules
- Difficult to filter logs by severity
- Hard to set appropriate log levels per environment
- Confusion about when to use which level

### Issue 3: Missing Structured Logs

**Problem:** Logs are plain text strings without structured data

**Impact:**
- Difficult to parse and analyze logs programmatically
- Hard to search and filter logs
- Missing metadata makes debugging difficult
- Cannot aggregate log data effectively
- Poor observability and monitoring

### Issue 4: Mixed console.log / Custom Logs

**Problem:** Developers use `console.log` alongside custom logging utilities

**Impact:**
- Inconsistent logging behavior
- `console.log` statements left in production code
- No control over log output
- Difficult to disable or filter logs
- Poor logging discipline

### Issue 5: Missing Correlation IDs

**Problem:** Logs don't include correlation IDs to track requests across services

**Impact:**
- Cannot trace requests across multiple services
- Difficult to debug distributed systems
- Hard to correlate related log entries
- Poor request tracing capabilities
- Difficult to diagnose issues

### Issue 6: Unscoped Logs

**Problem:** Logs don't include context about which module or service generated them

**Impact:**
- Hard to identify source of log entries
- Difficult to filter logs by module
- Unclear which part of system generated log
- Poor log organization
- Difficult to debug module-specific issues

### Issue 7: Noisy Logs in Production

**Problem:** Too many logs in production, including debug and verbose logs

**Impact:**
- Performance impact from excessive logging
- Increased log storage costs
- Hard to find important logs
- Log noise makes debugging harder
- Poor signal-to-noise ratio

### Issue 8: Logs Missing Metadata

**Problem:** Logs don't include useful metadata like user ID, request ID, timestamps, etc.

**Impact:**
- Missing context for debugging
- Cannot filter logs by metadata
- Hard to correlate logs with user actions
- Poor observability
- Difficult to analyze log patterns

### Issue 9: No Environment-Aware Logging

**Problem:** Same log level used in all environments regardless of needs

**Impact:**
- Too verbose in production
- Not verbose enough in development
- Cannot adjust logging per environment
- Poor developer experience in dev
- Performance issues in production

### Issue 10: Inconsistent Error Logging

**Problem:** Errors logged inconsistently, some with stack traces, some without

**Impact:**
- Missing error context
- Inconsistent error information
- Hard to debug errors
- Missing stack traces when needed
- Poor error observability

### Issue 11: No Log Batching or Rate Limiting

**Problem:** Logs sent individually without batching or rate limiting

**Impact:**
- Performance overhead from many log calls
- Potential log ingestion overload
- Increased network overhead
- Higher costs for remote logging
- Poor performance under load

### Issue 12: Missing Request-Scoped Logging

**Problem:** Logs not scoped to requests, making it hard to trace request flow

**Impact:**
- Cannot trace request through system
- Hard to debug request-specific issues
- Missing request context in logs
- Poor request observability
- Difficult to correlate request logs

---

## 2. Unified Logger Goals

### Single Logger Entrypoint

**Goal:** One unified logger that all modules use

**Benefits:**
- Consistent logging behavior
- Single place to configure logging
- Easy to update logging strategy
- Unified logging API
- Consistent log format

### Consistent API

**Goal:** Same logging API across all modules

**Benefits:**
- Easy to learn and use
- Consistent developer experience
- Predictable logging behavior
- Easy to refactor logging
- Better code maintainability

### Structured Logging

**Goal:** All logs in structured format (JSON)

**Benefits:**
- Easy to parse and analyze
- Better search and filtering
- Rich metadata support
- Better observability
- Easier log aggregation

### Environment-Aware Verbosity

**Goal:** Log levels adjust automatically per environment

**Benefits:**
- Appropriate verbosity per environment
- Better performance in production
- Better debugging in development
- Reduced log noise
- Optimal logging per environment

### Correlation ID Propagation

**Goal:** Correlation IDs automatically included in all logs

**Benefits:**
- Request tracing across services
- Easy to correlate related logs
- Better debugging capabilities
- Improved observability
- Distributed tracing support

### Transport Flexibility

**Goal:** Support multiple log transports (console, file, remote)

**Benefits:**
- Console for development
- File for local debugging
- Remote for production monitoring
- Flexible log delivery
- Environment-appropriate transports

---

## 3. Logger API Blueprint (Conceptual)

### Log Levels

**Level Hierarchy:**
- `trace` â€” Very detailed debugging information
- `debug` â€” Debugging information
- `info` â€” General informational messages
- `warn` â€” Warning messages
- `error` â€” Error messages
- `fatal` â€” Critical errors that may cause system failure

**Level Usage:**
- `trace` â€” Detailed execution flow (dev only)
- `debug` â€” Development debugging (dev/staging)
- `info` â€” General information (all environments)
- `warn` â€” Warnings that don't stop execution
- `error` â€” Errors that are handled
- `fatal` â€” Critical errors requiring attention

### Metadata Support

**Metadata Capabilities:**
- Attach arbitrary metadata to logs
- Structured metadata object
- Type-safe metadata
- Nested metadata support
- Metadata inheritance

**Metadata Usage:**
- Include context in logs
- Add request-specific data
- Include user information
- Add performance metrics
- Include error details

### Context Scoping

**Scoped Loggers:**
- Create logger with context
- Context automatically included in all logs
- Nested context support
- Context inheritance
- Context override capability

**Context Usage:**
- Module-scoped loggers
- Request-scoped loggers
- Function-scoped loggers
- Background job loggers
- Service-scoped loggers

### Correlation ID Injection

**Correlation ID Support:**
- Automatic correlation ID generation
- Correlation ID propagation
- Request-scoped correlation IDs
- Background job correlation IDs
- Cross-service correlation IDs

**Correlation ID Usage:**
- Track requests across services
- Correlate related log entries
- Debug distributed systems
- Trace request flow
- Monitor request performance

### Environment Modes

**Environment Configuration:**
- Development mode (verbose)
- Staging mode (moderate)
- Production mode (minimal)
- Test mode (suppressed)
- Custom mode (configurable)

**Mode Behavior:**
- Different log levels per mode
- Different transports per mode
- Different formats per mode
- Different verbosity per mode
- Mode-specific configuration

---

## 4. Structured Log Format

### JSON-Based Structure

**Log Structure:**
- Timestamp (ISO 8601)
- Level (trace/debug/info/warn/error/fatal)
- Message (human-readable string)
- Module/Service name (source identifier)
- RequestId/CorrelationId (request tracking)
- Metadata object (structured data)

### Timestamp

**Format:** ISO 8601 timestamp with timezone

**Purpose:**
- Precise time tracking
- Timezone-aware logging
- Easy to parse and sort
- Consistent time format
- Cross-service time correlation

### Level

**Format:** String enum (trace, debug, info, warn, error, fatal)

**Purpose:**
- Filter logs by severity
- Set appropriate log levels
- Monitor log level distribution
- Alert on error/fatal logs
- Environment-specific filtering

### Message

**Format:** Human-readable string

**Purpose:**
- Quick log understanding
- Human-readable context
- Searchable log text
- Error descriptions
- Informational messages

### Module/Service Name

**Format:** String identifier (e.g., "auth-service", "user-module")

**Purpose:**
- Identify log source
- Filter logs by module
- Module-specific monitoring
- Debug module-specific issues
- Organize logs by source

### RequestId/CorrelationId

**Format:** UUID or unique string identifier

**Purpose:**
- Track requests across services
- Correlate related log entries
- Trace request flow
- Debug request-specific issues
- Monitor request performance

### Metadata Object

**Format:** Structured JSON object

**Purpose:**
- Rich context information
- Searchable log data
- Filterable log fields
- Performance metrics
- Error details and stack traces

---

## 5. Scopes & Namespaces

### Module-Scoped Loggers

**Module Loggers:**
- Each module creates scoped logger
- Logger includes module name
- Module context in all logs
- Easy to identify log source
- Module-specific configuration

**Usage:**
- Create logger per module
- Module name in all logs
- Filter logs by module
- Module-specific log levels
- Module-specific transports

### Context Propagation

**Context Inheritance:**
- Context passed to child loggers
- Nested context support
- Context merged automatically
- Context override capability
- Context inheritance chain

**Propagation Rules:**
- Child loggers inherit parent context
- Context merged, not replaced
- Explicit context takes precedence
- Context propagated through async operations
- Context preserved across boundaries

### Background Job Logging

**Background Job Loggers:**
- Separate logger for background jobs
- Job-specific context
- Job correlation IDs
- Job metadata included
- Job-specific log levels

**Background Job Rules:**
- Background jobs use scoped logger
- Job ID in all logs
- Job metadata included
- Job-specific correlation IDs
- Background job log filtering

### API Handler Logging

**Request-Scoped Loggers:**
- Logger scoped to request
- Request ID in all logs
- Request metadata included
- Request correlation IDs
- Request-specific log levels

**API Handler Rules:**
- Each request gets scoped logger
- Request ID propagated
- Request metadata included
- Request correlation IDs
- Request log filtering

---

## 6. Transport Strategy

### Console Transport (Dev)

**Purpose:** Development environment logging

**Characteristics:**
- Human-readable format
- Color-coded output
- Pretty-printed JSON
- Immediate output
- No batching

**Usage:**
- Development environment
- Local debugging
- Quick log viewing
- Developer-friendly format
- Immediate feedback

### File Transport (Optional)

**Purpose:** Local log file storage

**Characteristics:**
- Structured JSON format
- File rotation support
- Configurable file size limits
- Log retention policies
- Optional compression

**Usage:**
- Local debugging
- Log archival
- Offline log analysis
- Development testing
- Optional production use

### Remote Log Ingestion (Prod)

**Purpose:** Production log monitoring

**Characteristics:**
- Batched log delivery
- Rate limiting
- Retry logic
- Error handling
- Secure transmission

**Usage:**
- Production monitoring
- Centralized log aggregation
- Log analysis and alerting
- Performance monitoring
- Error tracking

### Batching and Rate Limiting

**Batching Strategy:**
- Batch logs before sending
- Configurable batch size
- Time-based batching
- Size-based batching
- Batch on flush

**Rate Limiting:**
- Limit logs per second
- Prevent log ingestion overload
- Configurable rate limits
- Graceful degradation
- Rate limit monitoring

### Error Transport Fallback

**Fallback Strategy:**
- Fallback to console on remote failure
- Fallback to file on remote failure
- Retry failed log deliveries
- Queue logs during outages
- Error notification for transport failures

**Fallback Rules:**
- Try primary transport first
- Fallback on failure
- Retry with backoff
- Queue during outages
- Notify on persistent failures

---

## 7. Deprecation & Replacement Map

### Keep

**Patterns to Keep:**
- Structured logging approach (if exists)
- Useful log metadata patterns
- Good log level usage (if consistent)
- Effective log formats (if structured)
- Useful logging utilities (if well-designed)

**Keep Criteria:**
- Aligns with unified logger goals
- Provides useful functionality
- Well-designed and consistent
- Adds value to logging
- Can be integrated into unified logger

### Replace with Unified Logger

**Patterns to Replace:**
- Multiple logger utilities
- Inconsistent logging APIs
- Custom logging implementations
- Module-specific loggers
- Inconsistent log formats

**Replacement Strategy:**
- Migrate to unified logger
- Replace custom implementations
- Standardize on unified API
- Remove redundant loggers
- Consolidate logging code

### Remove (Debug-Only Artifacts)

**Patterns to Remove:**
- `console.log` statements
- Debug-only logging code
- Temporary logging statements
- Verbose development logs
- Test logging code

**Removal Criteria:**
- Debug-only usage
- Not needed in production
- Temporary or experimental
- Replaced by unified logger
- No production value

---

## 8. Migration Strategy

### Step 1: Audit Existing Logging Calls
- Identify all logging calls across codebase
- Catalog logging utilities used
- Map logging patterns
- Document current logging structure
- Identify logging inconsistencies
- Can run in parallel: Yes (multiple auditors)

### Step 2: Implement Unified Logger Entrypoint
- Design unified logger API
- Implement logger core functionality
- Add structured logging support
- Implement log level system
- Add metadata support
- Can run in parallel: No (requires Step 1)

### Step 3: Migrate Module by Module
- Migrate one module at a time
- Replace existing loggers with unified logger
- Update log calls to use unified API
- Add module-scoped loggers
- Test logging after migration
- Can run in parallel: Yes (different modules)

### Step 4: Enforce Lint Rule: "No console.log"
- Add ESLint rule to forbid console.log
- Add rule to forbid console.error, etc.
- Enforce unified logger usage
- Update existing console.log calls
- Add rule to CI/CD pipeline
- Can run in parallel: After Step 3

### Step 5: Add Correlation IDs
- Implement correlation ID generation
- Add correlation ID propagation
- Update request handlers to include correlation IDs
- Update background jobs to include correlation IDs
- Test correlation ID propagation
- Can run in parallel: After Step 2

### Step 6: Update Production Log Ingestion
- Configure remote log transport
- Set up log batching
- Configure rate limiting
- Test log delivery
- Monitor log ingestion
- Can run in parallel: After Step 3

### Step 7: Remove Deprecated Loggers
- Remove old logger utilities
- Remove unused logging code
- Clean up deprecated logging patterns
- Update documentation
- Archive old logging code
- Can run in parallel: After Step 3

**Execution Order:**
- Steps 1-2: Serial (audit â†’ implement)
- Steps 3-5: Can run in parallel (migrate â†’ lint â†’ correlation)
- Steps 6-7: Can run in parallel (ingestion â†’ cleanup)

---

## 9. Risk Map

### Log Noise Explosion

**Risk:** Too many logs generated, overwhelming log systems

**Mitigation:**
- Environment-aware log levels
- Rate limiting and batching
- Log filtering and sampling
- Monitor log volume
- Set log level appropriately
- Review and adjust log levels
- Log volume alerts

### Dropped Logs

**Risk:** Logs may be dropped during high load or transport failures

**Mitigation:**
- Batching and queuing
- Retry logic for failed deliveries
- Fallback transports
- Monitor log delivery
- Alert on log drops
- Buffer logs during outages
- Log delivery health checks

### Missing Metadata

**Risk:** Important metadata may be missing from logs

**Mitigation:**
- Structured logging requirements
- Metadata validation
- Required metadata fields
- Metadata documentation
- Code review for metadata
- Metadata testing
- Metadata audit

### Inconsistent Log Formats

**Risk:** Logs may have inconsistent formats despite unification

**Mitigation:**
- Strict format validation
- Schema enforcement
- Format testing
- Code review for format
- Format documentation
- Format monitoring
- Format migration tools

### Performance Issues with Heavy Logging

**Risk:** Excessive logging may impact application performance

**Mitigation:**
- Async logging
- Batching and buffering
- Rate limiting
- Performance monitoring
- Log level optimization
- Performance testing
- Performance budgets

### Correlation ID Loss

**Risk:** Correlation IDs may be lost during async operations or service boundaries

**Mitigation:**
- Correlation ID propagation
- Async context preservation
- Service boundary handling
- Correlation ID validation
- Correlation ID testing
- Monitor correlation ID coverage
- Correlation ID documentation

### Log Security Issues

**Risk:** Sensitive data may be logged, causing security issues

**Mitigation:**
- Data sanitization
- Sensitive data filtering
- Log access controls
- Security audit of logs
- Sensitive data detection
- Log encryption (if needed)
- Security guidelines

---

## Summary

This plan establishes:
- Current logging audit identifying 12 key issues
- Unified logger goals (single entrypoint, consistent API, structured logging, environment-aware, correlation IDs, transport flexibility)
- Logger API blueprint (log levels, metadata, context scoping, correlation IDs, environment modes)
- Structured log format (JSON with timestamp, level, message, module, correlation ID, metadata)
- Scopes and namespaces (module-scoped, context propagation, background jobs, API handlers)
- Transport strategy (console, file, remote, batching, fallback)
- Deprecation and replacement map (keep/replace/remove)
- Migration strategy with 7 steps
- Risk map with mitigation strategies

Ready for review before implementation begins.
