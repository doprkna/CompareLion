## C15 â€” OpenAPI â†’ Generated API Clients

### Purpose

This document defines the plan for introducing OpenAPI specification and generated API clients in Parel. It provides an API problems audit, OpenAPI strategy, schema blueprint, generated client goals, client architecture, request/response conventions, error handling, codegen pipeline, migration strategy, and risk map for structural planning.

---

# C15 â€” OpenAPI â†’ Generated API Clients â€” Planning Document

## 1. Current API Problems Audit

### Issue 1: Hand-Written API Client Logic

**Problem:** API clients written manually with custom fetch logic scattered across codebase

**Impact:**
- Inconsistent API usage patterns
- Duplicated fetch logic
- Hard to maintain and update
- Error-prone manual implementation
- No single source of truth

### Issue 2: Inconsistent Request/Response Types

**Problem:** Request and response types defined inconsistently across different API calls

**Impact:**
- Type inconsistencies
- Hard to maintain type safety
- Difficult to refactor
- Poor developer experience
- Increased bug risk

### Issue 3: Missing Type Guarantees

**Problem:** API calls lack strong type guarantees, leading to runtime errors

**Impact:**
- Runtime type errors
- Poor type safety
- Difficult to catch errors early
- Reduced developer confidence
- Increased debugging time

### Issue 4: Duplicated Fetch Logic

**Problem:** Same fetch patterns implemented multiple times across modules

**Impact:**
- Code duplication
- Inconsistent error handling
- Hard to update fetch logic
- Maintenance overhead
- Poor code organization

### Issue 5: Inconsistent Error Models

**Problem:** Different endpoints return errors in different formats

**Impact:**
- Inconsistent error handling
- Difficult to handle errors uniformly
- Poor error user experience
- Hard to debug errors
- Increased complexity

### Issue 6: Manual DTO Drift

**Problem:** DTOs manually maintained and drift from actual API responses

**Impact:**
- DTOs don't match API reality
- Runtime errors from mismatches
- Hard to keep DTOs in sync
- Maintenance burden
- Poor type safety

### Issue 7: No Single API Definition

**Problem:** No centralized API definition, endpoints documented inconsistently

**Impact:**
- No single source of truth
- Hard to discover available endpoints
- Inconsistent API documentation
- Difficult to maintain API contract
- Poor API governance

### Issue 8: Request Envelope Inconsistencies

**Problem:** Request formats vary across endpoints without consistent envelope structure

**Impact:**
- Inconsistent request handling
- Hard to validate requests
- Poor API consistency
- Difficult to maintain
- Increased complexity

### Issue 9: Missing API Documentation

**Problem:** API endpoints lack comprehensive documentation

**Impact:**
- Hard to discover API capabilities
- Difficult to understand API usage
- Poor developer onboarding
- Increased support burden
- Reduced API adoption

### Issue 10: No API Versioning Strategy

**Problem:** No clear versioning strategy for API changes

**Impact:**
- Breaking changes affect clients
- Difficult to evolve API
- Poor backward compatibility
- Deployment risks
- Client update challenges

### Issue 11: Inconsistent Authentication Handling

**Problem:** Authentication handled differently across API calls

**Impact:**
- Inconsistent auth patterns
- Security vulnerabilities
- Hard to maintain auth logic
- Poor security practices
- Increased risk

### Issue 12: No API Contract Validation

**Problem:** No validation that API implementation matches contract

**Impact:**
- Contract drift
- Runtime errors
- Poor API reliability
- Difficult to maintain
- Increased debugging

---

## 2. OpenAPI Strategy

### Goals of Introducing OpenAPI

**Primary Goals:**
- Single source of truth for API definition
- Type-safe API clients
- Consistent API contract
- Better API documentation
- Improved developer experience

**Secondary Goals:**
- API contract validation
- Better API governance
- Easier API evolution
- Reduced maintenance burden
- Better tooling support

### What Must Be Included in the Spec

**Required Elements:**
- All API endpoints
- Request and response schemas
- Authentication requirements
- Error responses
- Pagination patterns
- Query parameters
- Path parameters
- Request bodies

**Optional Elements:**
- Examples
- Descriptions
- Tags and categories
- Deprecation markers
- Version information

### Single Source of Truth for Endpoints

**Strategy:**
- OpenAPI spec is authoritative API definition
- All endpoints documented in spec
- Spec drives client generation
- Spec validates API implementation
- Spec serves as API documentation

**Benefits:**
- No duplicate API definitions
- Consistent API contract
- Easy to discover endpoints
- Better API governance
- Reduced drift

### How Schemas Represent Domain Entities

**Schema Approach:**
- Schemas represent domain entities
- Reusable schema components
- Consistent entity representation
- Clear entity relationships
- Domain-driven schema design

**Schema Organization:**
- Grouped by domain
- Reusable components
- Clear naming conventions
- Consistent patterns
- Well-documented schemas

### Non-Functional Metadata

**Authentication Metadata:**
- Required authentication methods
- Security schemes
- Token requirements
- Permission requirements

**Tags and Categories:**
- Endpoint categorization
- API organization
- Documentation grouping
- Logical grouping

**Error Metadata:**
- Error response schemas
- Error codes
- Error descriptions
- Error handling guidance

---

## 3. OpenAPI Schema Blueprint

### Endpoint Categories

**Auth Endpoints:**
- Authentication operations
- Authorization checks
- Token management
- User session operations

**Challenge Endpoints:**
- Challenge CRUD operations
- Challenge completion
- Challenge progress tracking
- Challenge recommendations

**Story Endpoints:**
- Story retrieval
- Story progression
- Story choices
- Story state management

**Social Endpoints:**
- User profiles
- Follow/unfollow
- Activity feeds
- Social interactions

**Progression Endpoints:**
- XP tracking
- Level management
- Streak tracking
- Achievement management

**Event Endpoints:**
- Event listing
- Event participation
- Event progress
- Event rewards

### Request Types

**Request Patterns:**
- Simple requests (no body)
- Request with body
- Request with query parameters
- Request with path parameters
- Complex requests (multiple parameters)

**Request Schema:**
- Consistent request structure
- Required vs optional fields
- Field validation rules
- Request examples
- Request documentation

### Response Envelopes

**Envelope Structure:**
- Success response envelope
- Error response envelope
- Consistent envelope format
- Metadata in envelope
- Data payload in envelope

**Envelope Fields:**
- Success flag
- Data payload
- Error information
- Metadata (timestamp, request ID)
- Pagination (if applicable)

### Pagination Schema

**Pagination Structure:**
- Page-based pagination
- Cursor-based pagination
- Consistent pagination format
- Pagination metadata
- Pagination links

**Pagination Fields:**
- Current page/cursor
- Page size
- Total count
- Has more flag
- Next/previous links

### Error Schema

**Error Structure:**
- Error code
- Error message
- Error details
- Request correlation ID
- Timestamp

**Error Types:**
- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Server errors

### Metadata Schema

**Metadata Fields:**
- Request timestamp
- Request ID
- API version
- Response time
- Additional metadata

**Metadata Usage:**
- Request tracking
- Debugging support
- Performance monitoring
- API versioning
- Audit trail

---

## 4. Generated Client Goals

### Strong Typing

**Benefit:** Generated clients provide strong type safety for all API calls

**Impact:**
- Compile-time error detection
- Better IDE support
- Reduced runtime errors
- Improved developer experience
- Better code quality

### DTO Consistency

**Benefit:** Generated DTOs ensure consistency across all API interactions

**Impact:**
- Consistent data structures
- No manual DTO maintenance
- Reduced drift
- Better type safety
- Easier maintenance

### Auto-Updating Client on Schema Changes

**Benefit:** Client automatically updates when OpenAPI spec changes

**Impact:**
- Always in sync with API
- No manual client updates
- Reduced maintenance
- Faster API evolution
- Better consistency

### Zero Manual Fetch Logic

**Benefit:** No need to write manual fetch code, generated client handles it

**Impact:**
- Reduced code duplication
- Consistent API usage
- Less boilerplate code
- Faster development
- Better maintainability

### Predictable Error Handling

**Benefit:** Consistent error handling across all API calls

**Impact:**
- Uniform error experience
- Easier error handling
- Better error recovery
- Improved user experience
- Reduced complexity

### Simpler Feature Development

**Benefit:** Developers can focus on features, not API client implementation

**Impact:**
- Faster feature development
- Reduced development time
- Better developer experience
- Less boilerplate code
- Improved productivity

### Better API Discovery

**Benefit:** Generated clients make it easy to discover available API endpoints

**Impact:**
- Easier API exploration
- Better developer onboarding
- Reduced documentation needs
- Improved API adoption
- Better developer experience

### Contract Validation

**Benefit:** OpenAPI spec enables contract validation between client and server

**Impact:**
- Early error detection
- Better API reliability
- Reduced runtime errors
- Improved quality
- Better testing

---

## 5. Client Architecture Blueprint

### One Root Client

**Root Client Structure:**
- Single entry point for API access
- Manages base configuration
- Handles common concerns
- Provides unified API surface
- Centralized client management

**Root Client Responsibilities:**
- Base URL configuration
- Authentication management
- Request/response interceptors
- Error handling
- Logging

### Module-Based Subclients

**Subclient Organization:**
- Subclients organized by domain
- Each domain has its own client
- Clear separation of concerns
- Easy to navigate
- Logical organization

**Subclient Examples:**
- Auth client
- Challenge client
- Story client
- Social client
- Progression client
- Event client

### Typed Error Classes

**Error Class Structure:**
- Error classes for each error type
- Typed error handling
- Error-specific properties
- Consistent error interface
- Better error handling

**Error Types:**
- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Server errors

### Typed Pagination Responses

**Pagination Response Structure:**
- Typed pagination metadata
- Typed data arrays
- Pagination helper methods
- Consistent pagination interface
- Type-safe pagination

**Pagination Features:**
- Type-safe page navigation
- Pagination metadata access
- Helper methods for pagination
- Consistent pagination patterns
- Better developer experience

### Interceptors (Conceptual Only)

**Interceptor Types:**
- Request interceptors
- Response interceptors
- Error interceptors
- Authentication interceptors
- Logging interceptors

**Interceptor Usage:**
- Request transformation
- Response transformation
- Error handling
- Authentication injection
- Logging and monitoring

### Environment Injection

**Environment Configuration:**
- Base URL injection
- Authentication token injection
- Environment-specific config
- Runtime configuration
- Flexible configuration

**Configuration Sources:**
- Environment variables
- Configuration files
- Runtime configuration
- Default values
- Override mechanisms

---

## 6. Conventions for Request/Response Models

### Request Payload Naming

**Naming Conventions:**
- Use descriptive names
- Follow domain naming
- Consistent naming patterns
- Clear and unambiguous
- Follow established conventions

**Naming Patterns:**
- Request suffix for request types
- Domain prefix for domain-specific types
- Clear and descriptive names
- Consistent across endpoints
- Easy to understand

### Response Envelope Shape

**Envelope Structure:**
- Consistent envelope format
- Success/error flag
- Data payload
- Metadata fields
- Error information

**Envelope Rules:**
- Always use envelope
- Consistent field names
- Required fields present
- Optional fields documented
- Clear envelope structure

### Required vs Optional Fields

**Field Requirements:**
- Clearly mark required fields
- Document optional fields
- Provide default values where appropriate
- Validate required fields
- Handle optional fields gracefully

**Field Documentation:**
- Document field requirements
- Explain field purposes
- Provide field examples
- Document field constraints
- Clear field documentation

### Timestamp Formats

**Timestamp Standard:**
- ISO 8601 format
- UTC timezone
- Consistent format
- Parseable format
- Human-readable format

**Timestamp Usage:**
- Consistent across API
- Clear timezone handling
- Parseable format
- Validation support
- Documentation

### Canonical DTO Naming Conventions

**DTO Naming:**
- Descriptive names
- Domain-based naming
- Consistent patterns
- Clear naming conventions
- Easy to understand

**Naming Rules:**
- Use domain terminology
- Follow established patterns
- Consistent across API
- Clear and descriptive
- Avoid abbreviations

---

## 7. Error Shape & Exceptions

### Error Structure

**Error Components:**
- Error code
- Error message
- Error details
- Correlation/request ID
- Timestamp

**Error Format:**
- Consistent error structure
- Typed error classes
- Error-specific properties
- Clear error information
- Actionable error messages

### Error Code

**Error Code System:**
- Categorized error codes
- Consistent code format
- Clear code meanings
- Documented codes
- Extensible code system

**Error Code Categories:**
- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Server errors

### Error Message

**Message Requirements:**
- Human-readable messages
- Actionable messages
- Clear error descriptions
- Contextual information
- User-friendly messages

**Message Guidelines:**
- Avoid technical jargon
- Provide context
- Suggest solutions
- Clear and concise
- Helpful messages

### Error Details

**Details Structure:**
- Additional error information
- Field-specific errors
- Validation details
- Context information
- Debug information

**Details Usage:**
- Field validation errors
- Additional context
- Debug information
- Error-specific data
- Helpful details

### Correlation/Request IDs

**ID Purpose:**
- Request tracking
- Error correlation
- Debugging support
- Log correlation
- Support assistance

**ID Usage:**
- Include in all errors
- Enable request tracking
- Support debugging
- Log correlation
- User support

### HTTP Mapping

**HTTP Status Codes:**
- Map errors to HTTP codes
- Consistent status mapping
- Standard HTTP codes
- Clear status meanings
- Proper status usage

**Status Code Mapping:**
- Validation errors â†’ 400
- Authentication errors â†’ 401
- Authorization errors â†’ 403
- Not found errors â†’ 404
- Server errors â†’ 500

---

## 8. Codegen Pipeline (Conceptual)

### Maintain OpenAPI Spec

**Spec Maintenance:**
- Keep spec up to date
- Update spec with API changes
- Review spec regularly
- Validate spec correctness
- Document spec changes

**Maintenance Process:**
- Update spec with API changes
- Review spec in code reviews
- Validate spec syntax
- Test spec completeness
- Document spec updates

### Validate Spec in CI

**CI Validation:**
- Validate spec syntax
- Check spec completeness
- Verify spec consistency
- Test spec against implementation
- Ensure spec quality

**Validation Steps:**
- Syntax validation
- Schema validation
- Completeness checks
- Consistency checks
- Implementation validation

### Generate Clients Automatically

**Generation Process:**
- Automatic client generation
- Triggered by spec changes
- Consistent generation
- Reproducible generation
- Versioned generation

**Generation Triggers:**
- Spec file changes
- CI/CD pipeline
- Manual trigger
- Scheduled generation
- Version updates

### Commit Generated Clients or Not (Policy)

**Commit Policy Options:**
- Commit generated clients (versioned)
- Don't commit (generate on build)
- Commit with review
- Commit automatically
- Policy decision required

**Policy Considerations:**
- Version control clarity
- Build process simplicity
- Review process
- Generation consistency
- Team preferences

### Version Bump Rules

**Versioning Strategy:**
- Semantic versioning
- Version bump on changes
- Breaking change versioning
- Feature addition versioning
- Patch versioning

**Version Rules:**
- Major version for breaking changes
- Minor version for new features
- Patch version for fixes
- Clear versioning policy
- Documented versioning

---

## 9. Migration Strategy

### Step 1: Audit Endpoints

**Process:**
- Identify all API endpoints
- Catalog endpoint details
- Document current API usage
- Map endpoint dependencies
- Identify API patterns

**Output:**
- Complete endpoint inventory
- API usage documentation
- Endpoint dependency map
- Can run in parallel: Yes (multiple auditors)

### Step 2: Create Initial OpenAPI Skeleton

**Process:**
- Create OpenAPI spec structure
- Define basic spec format
- Set up spec organization
- Create initial endpoints
- Establish spec conventions

**Output:**
- OpenAPI spec skeleton
- Spec structure defined
- Initial endpoints documented
- Can run in parallel: No (requires Step 1)

### Step 3: Define Schemas Gradually

**Process:**
- Define domain schemas
- Create reusable components
- Document schema relationships
- Validate schemas
- Iterate on schemas

**Output:**
- Complete schema definitions
- Reusable components
- Schema documentation
- Can run in parallel: After Step 2

### Step 4: Add Major Endpoints

**Process:**
- Add critical endpoints to spec
- Document endpoint details
- Define request/response schemas
- Add error definitions
- Validate endpoints

**Output:**
- Major endpoints documented
- Endpoint schemas defined
- Can run in parallel: After Step 3

### Step 5: Replace Manual Clients with Generated Ones

**Process:**
- Generate initial clients
- Replace manual client code
- Update API usage
- Test generated clients
- Validate client functionality

**Output:**
- Generated clients in use
- Manual clients replaced
- Can run in parallel: After Step 4

### Step 6: Remove Deprecated Fetch Logic

**Process:**
- Identify deprecated fetch code
- Remove unused fetch logic
- Clean up old client code
- Update references
- Validate removal

**Output:**
- Deprecated code removed
- Codebase cleaned up
- Can run in parallel: After Step 5

### Step 7: Enforce OpenAPI-First Development

**Process:**
- Establish OpenAPI-first workflow
- Require spec updates for new endpoints
- Enforce spec review
- Update development guidelines
- Train team on workflow

**Output:**
- OpenAPI-first workflow established
- Development guidelines updated
- Team trained on workflow
- Can run in parallel: After Step 6

**Execution Order:**
- Steps 1-2: Serial (audit â†’ skeleton)
- Steps 3-4: Can run in parallel (schemas â†’ endpoints)
- Steps 5-6: Serial (replace â†’ remove)
- Step 7: After Step 6 (enforce)

---

## 10. Risk Map

### Schema Drift

**Risk:** OpenAPI spec may drift from actual API implementation

**Mitigation:**
- Regular spec validation
- Contract testing
- Spec review process
- Automated validation
- Spec-implementation sync checks
- Regular audits
- Validation in CI/CD

### Incomplete Coverage

**Risk:** OpenAPI spec may not cover all endpoints

**Mitigation:**
- Comprehensive endpoint audit
- Regular spec reviews
- Endpoint coverage checks
- Missing endpoint detection
- Gradual spec expansion
- Coverage monitoring
- Team awareness

### Breaking Client After Regeneration

**Risk:** Regenerating clients may break existing code

**Mitigation:**
- Version client generation
- Test client generation
- Gradual client updates
- Backward compatibility checks
- Client versioning
- Staged rollout
- Rollback plan

### Wrong Envelope Definitions

**Risk:** Response envelope definitions may be incorrect

**Mitigation:**
- Careful envelope design
- Envelope validation
- Envelope testing
- Review envelope structure
- Validate against implementation
- Envelope documentation
- Regular envelope review

### Developer Misuse of Generated Client

**Risk:** Developers may misuse generated client APIs

**Mitigation:**
- Client documentation
- Usage examples
- Code review process
- Developer training
- Best practices guide
- Linting rules
- Regular code reviews

### Spec Maintenance Burden

**Risk:** Maintaining OpenAPI spec may become burdensome

**Mitigation:**
- Automated spec generation (where possible)
- Spec review process
- Spec maintenance guidelines
- Tooling support
- Regular spec cleanup
- Spec maintenance training
- Clear ownership

### Client Generation Failures

**Risk:** Client generation may fail or produce incorrect clients

**Mitigation:**
- Validate generation process
- Test generated clients
- Generation error handling
- Generation monitoring
- Fallback procedures
- Generation documentation
- Regular generation testing

---

## Summary

This plan establishes:
- Current API problems audit identifying 12 key issues
- OpenAPI strategy (goals, required elements, single source of truth, schemas, metadata)
- OpenAPI schema blueprint (endpoint categories, request/response types, envelopes, pagination, errors, metadata)
- Generated client goals (strong typing, DTO consistency, auto-updates, zero manual logic, predictable errors, simpler development)
- Client architecture blueprint (root client, subclients, typed errors, typed pagination, interceptors, environment injection)
- Request/response conventions (naming, envelope shape, required/optional, timestamps, DTO naming)
- Error shape and exceptions (error structure, codes, messages, details, correlation IDs, HTTP mapping)
- Codegen pipeline (maintain spec, validate, generate, commit policy, versioning)
- Migration strategy with 7 steps
- Risk map with mitigation strategies

Ready for review before implementation begins.
