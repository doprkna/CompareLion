## C13 â€” Migration Pruning

### Purpose

This document defines the plan for pruning and consolidating database migrations in the Parel codebase. It provides a migration problem audit, benefits of pruning, baseline migration strategy, baseline rules, new migration flow, safety rules, verification checklist, execution plan, and risk map for structural planning.

---

# C13 â€” Migration Pruning â€” Planning Document

## 1. Current Migration Problem Audit

### Issue 1: Long Migration History

**Problem:** Accumulated hundreds of migration files over time, creating a long migration chain

**Impact:**
- Slow migration execution in CI/CD
- Long time to set up new development environments
- Difficult to understand schema evolution
- Hard to identify which migrations are still relevant
- Increased complexity in migration management

### Issue 2: Broken or Conflicting Migrations

**Problem:** Some migrations fail to apply or conflict with each other

**Impact:**
- Migration failures block deployments
- Inconsistent database states across environments
- Difficult to reproduce issues
- Manual intervention required
- Deployment delays and risks

### Issue 3: Migrations Depending on Stale Schema

**Problem:** Migrations reference schema elements that no longer exist or have changed

**Impact:**
- Migration failures when applied
- Broken migration dependencies
- Cannot apply migrations in clean state
- Schema drift issues
- Migration rollback problems

### Issue 4: Legacy Tables No Longer in Use

**Problem:** Database contains tables and columns that are no longer used by application code

**Impact:**
- Database bloat
- Confusion about what's actually used
- Unnecessary storage costs
- Maintenance overhead
- Schema complexity

### Issue 5: Manual Patches in Service Code

**Problem:** Application code contains manual SQL patches to work around migration issues

**Impact:**
- Code complexity
- Hidden schema dependencies
- Difficult to maintain
- Risk of breaking changes
- Poor separation of concerns

### Issue 6: Inconsistent Naming

**Problem:** Migration files have inconsistent naming conventions

**Impact:**
- Hard to find specific migrations
- Difficult to understand migration purpose
- Poor organization
- Maintenance overhead
- Developer confusion

### Issue 7: Drift Between Schema and Database

**Problem:** Prisma schema doesn't match actual database state

**Impact:**
- Migration generation failures
- Unexpected migration diffs
- Schema validation issues
- Deployment risks
- Development environment inconsistencies

### Issue 8: Slow CI Due to Migration Chains

**Problem:** CI/CD pipelines take too long running all migrations

**Impact:**
- Slow feedback loops
- Increased CI costs
- Developer productivity impact
- Deployment delays
- Resource waste

### Issue 9: Orphaned Migration Files

**Problem:** Migration files exist but are no longer needed or referenced

**Impact:**
- Confusion about migration state
- Unnecessary files in repository
- Maintenance overhead
- Difficult to understand migration history
- Repository bloat

### Issue 10: Missing Migration Documentation

**Problem:** Migrations lack documentation about purpose and changes

**Impact:**
- Hard to understand why migrations exist
- Difficult to debug migration issues
- Poor knowledge transfer
- Maintenance challenges
- Onboarding difficulties

### Issue 11: Inconsistent Migration Patterns

**Problem:** Different migration styles and patterns used across migrations

**Impact:**
- Inconsistent migration quality
- Hard to maintain
- Difficult to review
- Poor migration practices
- Technical debt

### Issue 12: No Migration Rollback Strategy

**Problem:** Migrations cannot be easily rolled back or have no rollback plan

**Impact:**
- Deployment risks
- Difficult to recover from failed migrations
- No safety net for migrations
- Production deployment anxiety
- Limited migration flexibility

---

## 2. Why Migration Pruning Matters

### Faster CI

**Benefit:** Reduced migration chain means faster CI/CD pipeline execution

**Impact:**
- Quicker feedback on code changes
- Reduced CI costs
- Faster deployment cycles
- Better developer experience
- Improved productivity

### Simpler Onboarding

**Benefit:** New developers can set up databases quickly with baseline migration

**Impact:**
- Faster developer onboarding
- Reduced setup complexity
- Consistent development environments
- Better developer experience
- Lower onboarding costs

### Reduced Drift

**Benefit:** Baseline migration ensures schema matches database state

**Impact:**
- Consistent schema across environments
- Reduced migration failures
- Better schema management
- Easier debugging
- Improved reliability

### Fewer Backward-Compat Concerns

**Benefit:** Clean baseline reduces need to maintain backward compatibility

**Impact:**
- Simpler migration logic
- Reduced technical debt
- Easier schema evolution
- Less maintenance overhead
- Better code quality

### Cleaner Schema History

**Benefit:** Single baseline provides clear starting point for schema evolution

**Impact:**
- Easier to understand schema changes
- Better migration organization
- Clearer schema evolution
- Improved documentation
- Better maintainability

### Safer Deployments

**Benefit:** Baseline migration reduces risk of migration failures

**Impact:**
- More reliable deployments
- Reduced production risks
- Better deployment confidence
- Fewer rollback scenarios
- Improved stability

### Better Migration Management

**Benefit:** Clean migration history makes future migrations easier to manage

**Impact:**
- Easier migration review
- Better migration practices
- Improved migration quality
- Reduced technical debt
- Better long-term maintainability

### Improved Performance

**Benefit:** Fewer migrations mean faster database operations

**Impact:**
- Faster database setup
- Reduced migration execution time
- Better performance in CI/CD
- Improved development experience
- Lower resource usage

---

## 3. Baseline Migration Strategy (High-Level)

### Freeze New Migration Creation

**Step:** Temporarily stop creating new migrations during pruning process

**Purpose:**
- Prevent new migrations during pruning
- Ensure stable state for baseline creation
- Avoid conflicts during pruning
- Maintain consistency
- Reduce complexity

### Generate Fresh Schema from Prisma

**Step:** Use Prisma to generate current schema state

**Purpose:**
- Capture current schema accurately
- Ensure schema matches code
- Validate schema consistency
- Create schema snapshot
- Establish baseline reference

### Create Single Baseline Migration

**Step:** Generate one baseline migration representing current production state

**Purpose:**
- Consolidate all migrations into one
- Create clean starting point
- Simplify migration history
- Establish migration baseline
- Reduce migration complexity

### Mark Old Migrations as Archived

**Step:** Archive old migrations without deleting them

**Purpose:**
- Preserve migration history
- Maintain audit trail
- Keep reference for debugging
- Document migration evolution
- Provide historical context

### Reinitialize Dev Databases

**Step:** Reset development databases using baseline migration

**Purpose:**
- Test baseline migration
- Ensure consistent dev environments
- Validate migration process
- Test database setup
- Verify baseline correctness

### Validate Staging/Prod Alignment

**Step:** Verify baseline matches staging and production schemas

**Purpose:**
- Ensure baseline accuracy
- Validate production state
- Prevent schema drift
- Ensure consistency
- Reduce deployment risks

---

## 4. Rules for the New Baseline

### Baseline Must Match Current Prod Schema

**Rule:** Baseline migration must exactly match current production database schema

**Rationale:**
- Ensures consistency across environments
- Prevents schema drift
- Reduces deployment risks
- Ensures accurate baseline
- Maintains data integrity

### Remove Unused Tables/Fields if Confirmed Safe

**Rule:** Only remove unused elements after explicit confirmation they're safe to remove

**Rationale:**
- Prevents accidental data loss
- Ensures safety
- Requires explicit decisions
- Maintains data integrity
- Reduces risks

### No Data Loss Without Explicit Decision

**Rule:** Never remove data or schema elements without explicit approval

**Rationale:**
- Prevents accidental data loss
- Requires careful consideration
- Ensures data safety
- Maintains data integrity
- Reduces risks

### Schema Must Be Deterministic

**Rule:** Baseline migration must produce same result every time

**Rationale:**
- Ensures reproducibility
- Prevents inconsistencies
- Enables reliable testing
- Maintains consistency
- Reduces errors

### Strong Naming Consistency

**Rule:** All schema elements must follow consistent naming conventions

**Rationale:**
- Improves readability
- Reduces confusion
- Enables better tooling
- Maintains consistency
- Improves maintainability

### All Relations Must Be Valid

**Rule:** All foreign keys and relations must be properly defined and valid

**Rationale:**
- Ensures data integrity
- Prevents broken references
- Maintains referential integrity
- Reduces errors
- Improves reliability

### No Orphaned Records

**Rule:** Baseline must not create or leave orphaned records

**Rationale:**
- Ensures data integrity
- Prevents data inconsistencies
- Maintains referential integrity
- Reduces errors
- Improves data quality

---

## 5. New Migration Flow (Post-Pruning)

### Every Schema Change = One Migration

**Rule:** Each schema change creates exactly one migration file

**Purpose:**
- Clear migration history
- Easy to track changes
- Simple migration management
- Better organization
- Easier review

### Migrations Named Consistently

**Rule:** All migrations follow consistent naming convention

**Purpose:**
- Easy to identify migrations
- Better organization
- Clear migration purpose
- Improved readability
- Better tooling support

### No Manual SQL in Migrations Unless Required

**Rule:** Use Prisma migrations by default, manual SQL only when necessary

**Purpose:**
- Maintains consistency
- Reduces errors
- Easier to review
- Better tooling support
- Improved maintainability

### Mandatory Code Review

**Rule:** All migrations require code review before merging

**Purpose:**
- Ensures migration quality
- Catches errors early
- Maintains standards
- Improves safety
- Better migration practices

### Migration Previews in CI

**Rule:** CI pipeline shows migration previews before applying

**Purpose:**
- Early error detection
- Validation before deployment
- Reduced risks
- Better feedback
- Improved safety

### Environment-Specific Safety Checks

**Rule:** Different safety checks for dev, staging, and production

**Purpose:**
- Appropriate safety per environment
- Reduced production risks
- Better validation
- Environment-specific rules
- Improved safety

### Migration Testing Requirements

**Rule:** Migrations must be tested before deployment

**Purpose:**
- Ensures migration correctness
- Reduces deployment risks
- Validates migration logic
- Improves reliability
- Better quality assurance

---

## 6. Safety & Data Integrity

### Never Drop Columns Without Deprecation Period

**Rule:** Columns must be deprecated before removal

**Purpose:**
- Prevents breaking changes
- Allows migration time
- Maintains backward compatibility
- Reduces risks
- Better change management

### Require Data Backups Before Major Pruning

**Rule:** Full database backups required before major migration pruning

**Purpose:**
- Enables recovery if needed
- Provides safety net
- Reduces risks
- Ensures data safety
- Better risk management

### Require Schema Comparison Tools

**Rule:** Use tools to compare schema before and after pruning

**Purpose:**
- Validates schema accuracy
- Detects differences
- Ensures consistency
- Reduces errors
- Improves reliability

### Add Integrity Checks for Foreign Keys

**Rule:** Verify all foreign key relationships are valid

**Purpose:**
- Ensures data integrity
- Prevents broken references
- Maintains referential integrity
- Reduces errors
- Improves data quality

### Enforce Consistent Data Types

**Rule:** Ensure consistent data types across schema

**Purpose:**
- Prevents type mismatches
- Ensures consistency
- Reduces errors
- Improves data quality
- Better type safety

### Validate Indexes and Constraints

**Rule:** Ensure all indexes and constraints are properly defined

**Purpose:**
- Maintains data integrity
- Ensures performance
- Prevents data issues
- Maintains constraints
- Improves reliability

### Test Migration Rollback

**Rule:** Verify migrations can be rolled back safely

**Purpose:**
- Enables recovery
- Reduces deployment risks
- Provides safety net
- Improves reliability
- Better risk management

---

## 7. Migration Verification Checklist

### Matches Current Prod?

**Check:** Verify baseline migration matches current production schema exactly

**Validation:**
- Compare schema elements
- Verify all tables present
- Check all columns match
- Validate all relations
- Confirm data types match

### No Drift When Running `prisma migrate diff`

**Check:** Running migration diff should show no differences

**Validation:**
- Run diff tool
- Verify no differences
- Check all environments
- Validate consistency
- Confirm alignment

### All Relations Valid

**Check:** Verify all foreign key relationships are valid

**Validation:**
- Check all foreign keys
- Verify referential integrity
- Test relationship queries
- Validate constraints
- Confirm no broken references

### No Orphaned Records

**Check:** Ensure no orphaned records exist

**Validation:**
- Check foreign key constraints
- Verify referential integrity
- Test data relationships
- Validate data consistency
- Confirm no orphaned data

### Baseline Reproducible Across Envs

**Check:** Baseline migration produces same result in all environments

**Validation:**
- Test in dev environment
- Test in staging environment
- Compare results
- Verify consistency
- Confirm reproducibility

### All Indexes Present

**Check:** Verify all required indexes are defined

**Validation:**
- Check index definitions
- Verify index performance
- Test query performance
- Validate index usage
- Confirm all indexes present

### Migration Applies Cleanly

**Check:** Baseline migration applies without errors

**Validation:**
- Test migration application
- Verify no errors
- Check migration logs
- Validate database state
- Confirm clean application

---

## 8. Execution Plan

### Step 1: Audit Existing Migrations
- Identify all migration files
- Catalog migration history
- Document migration dependencies
- Identify broken migrations
- Map migration to schema changes
- Can run in parallel: Yes (multiple auditors)

### Step 2: Compare Schema vs DB with Diff Tools
- Use Prisma diff tools
- Compare schema to database
- Identify differences
- Document schema drift
- Validate current state
- Can run in parallel: After Step 1

### Step 3: Create Baseline.sql Conceptually
- Design baseline migration structure
- Plan baseline migration content
- Document baseline approach
- Define baseline requirements
- Plan baseline validation
- Can run in parallel: After Step 2

### Step 4: Archive Old Migrations
- Move old migrations to archive
- Document archived migrations
- Preserve migration history
- Create migration archive structure
- Document archive location
- Can run in parallel: After Step 3

### Step 5: Test Full Migration Cycle on Dev â†’ Stage
- Test baseline migration in dev
- Validate dev database state
- Test migration in staging
- Validate staging database state
- Compare dev and staging results
- Can run in parallel: After Step 4

### Step 6: Validate Production State
- Compare baseline to production
- Verify production schema matches
- Validate production data integrity
- Check production constraints
- Confirm production alignment
- Can run in parallel: After Step 5

### Step 7: Finalize Pruning
- Create final baseline migration
- Archive old migrations
- Update migration documentation
- Update development workflows
- Communicate changes to team
- Can run in parallel: After Step 6

**Execution Order:**
- Steps 1-2: Serial (audit â†’ compare)
- Steps 3-4: Can run in parallel (baseline â†’ archive)
- Steps 5-6: Serial (test â†’ validate)
- Step 7: After Steps 5-6 (finalize)

---

## 9. Risk Map

### Accidental Data Loss

**Risk:** Pruning process may accidentally remove data or schema elements

**Mitigation:**
- Comprehensive backups before pruning
- Explicit approval for data removal
- Schema comparison tools
- Data validation checks
- Rollback procedures
- Careful review process
- Staged rollout approach

### Broken Foreign Keys

**Risk:** Baseline migration may break foreign key relationships

**Mitigation:**
- Validate all foreign keys
- Test referential integrity
- Verify constraint definitions
- Check relationship validity
- Test data relationships
- Validate constraints
- Integrity checks

### Environment Drift

**Risk:** Baseline may not match all environments exactly

**Mitigation:**
- Compare all environments
- Validate environment alignment
- Use diff tools
- Test in all environments
- Verify consistency
- Document differences
- Align environments before pruning

### Rollback Failures

**Risk:** Cannot rollback baseline migration if issues occur

**Mitigation:**
- Comprehensive backups
- Test rollback procedures
- Document rollback steps
- Validate rollback capability
- Have rollback plan ready
- Test rollback in staging
- Monitor migration application

### Migration Sequence Corruption

**Risk:** Migration sequence may become corrupted during pruning

**Mitigation:**
- Preserve migration history
- Archive old migrations
- Document migration sequence
- Validate migration order
- Test migration application
- Verify migration integrity
- Maintain migration audit trail

### Schema Validation Failures

**Risk:** Baseline migration may fail schema validation

**Mitigation:**
- Comprehensive schema validation
- Test schema consistency
- Validate all constraints
- Check data types
- Verify indexes
- Test migration application
- Validate schema integrity

### Production Deployment Risks

**Risk:** Applying baseline migration in production may cause issues

**Mitigation:**
- Thorough testing in staging
- Validate production state
- Plan deployment carefully
- Have rollback ready
- Monitor deployment closely
- Test migration in production-like environment
- Staged rollout approach

---

## Summary

This plan establishes:
- Current migration problem audit identifying 12 key issues
- Benefits of migration pruning (faster CI, simpler onboarding, reduced drift, fewer backward-compat concerns, cleaner history, safer deployments)
- Baseline migration strategy with 6 high-level steps
- Rules for new baseline (match prod, safe removal, no data loss, deterministic, consistent naming)
- New migration flow (one migration per change, consistent naming, minimal manual SQL, code review, CI previews, environment checks)
- Safety and data integrity rules (deprecation periods, backups, comparison tools, integrity checks)
- Migration verification checklist (7 validation checks)
- Execution plan with 7 steps
- Risk map with mitigation strategies

Ready for review before implementation begins.
