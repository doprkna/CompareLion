## C10 â€” Content Pack Packaging

### Purpose

This document defines the plan for implementing content pack packaging system for Parel. It provides content pack definitions, pack structure blueprint, file formats, versioning rules, loader blueprint, merging rules, security safeguards, pack lifecycle, migration strategy, and risk map for structural planning.

---

# C10 â€” Content Pack Packaging â€” Planning Document

## 1. Content Pack Definition

### What is a Content Pack

A content pack is a self-contained, distributable bundle of game content that can be loaded, activated, and managed independently. Content packs enable modular content delivery, seasonal updates, downloadable content (DLC), and community-created content.

### Content Types in Packs

**Questions:**
- Challenge questions and prompts
- Multiple choice questions
- Open-ended questions
- Question metadata (difficulty, category, tags)
- Question validation rules

**Story Chunks:**
- Narrative text segments
- Story progression nodes
- Branching story paths
- Story metadata (chapter, act, sequence)
- Story dependencies and prerequisites

**Lore Fragments:**
- World building text
- Character descriptions
- Location descriptions
- Historical events
- Discovery entries
- Lore metadata (category, unlock conditions)

**Items / Modifiers:**
- Item definitions (name, description, effects)
- Modifier rules (XP multipliers, streak bonuses)
- Item rarity and categories
- Item metadata (unlock conditions, usage rules)
- Item relationships and dependencies

**Events:**
- World event definitions
- Event schedules and timing
- Event participation rules
- Event rewards and outcomes
- Event metadata (type, duration, requirements)

**Metadata:**
- Pack identification (name, version, author)
- Pack dependencies
- Pack compatibility information
- Content statistics
- Pack description and notes

### Conceptual Boundaries

**What Belongs in Packs:**
- Static content (questions, stories, lore)
- Content definitions (items, events, modifiers)
- Content metadata and relationships
- Content unlock conditions
- Content progression rules

**What Does NOT Belong in Packs:**
- User-specific data (progress, achievements)
- Runtime state (active challenges, current story state)
- System configuration (API endpoints, feature flags)
- Executable code or scripts
- User-generated content (unless packaged separately)

**Pack Scope:**
- Packs are immutable once created
- Packs can be versioned and updated
- Packs can depend on other packs
- Packs can be enabled/disabled independently
- Packs do not modify system behavior, only content

---

## 2. Pack Structure Blueprint

### Metadata

**Pack Identification:**
- Unique pack identifier (UUID or slug)
- Pack name and display name
- Pack version (semantic versioning)
- Author information
- Creation and modification timestamps

**Pack Information:**
- Description and summary
- Pack category (base, DLC, seasonal, community)
- Pack tags and keywords
- Pack size and content statistics
- Pack dependencies and requirements

**Compatibility:**
- Minimum game version required
- Maximum game version supported
- Required other packs
- Incompatible packs
- Schema version compatibility

### Manifest

**Content Inventory:**
- List of all content items in pack
- Content type counts (questions, stories, lore, items, events)
- Content identifiers and references
- Content organization structure
- Content relationships and dependencies

**Pack Structure:**
- File organization within pack
- File naming conventions
- File format specifications
- Content file locations
- Asset file locations (if any)

**Validation Information:**
- Schema version used
- Validation rules applied
- Content checksums or hashes
- Integrity verification data
- Pack signature (if signed)

### Payload

**Content Files:**
- Questions in structured format (JSONL or JSON)
- Story chunks in structured format
- Lore fragments in structured format
- Items and modifiers definitions
- Event definitions and schedules

**Content Organization:**
- Grouped by content type
- Organized by category or theme
- Hierarchical structure for large packs
- Cross-references between content
- Content metadata embedded

### Optional Assets

**Images:**
- Lore illustrations
- Event banners
- Item icons
- Story artwork
- Pack-specific graphics

**Audio:**
- Event sound effects
- Story narration audio
- Ambient sounds
- Pack-specific audio cues

**Other Assets:**
- Fonts (if pack-specific)
- Custom UI elements (if supported)
- Theme assets
- Localization files

### Optional Scripts (Non-Executable Descriptors)

**Content Rules:**
- Unlock condition definitions
- Progression rule definitions
- Content relationship rules
- Conditional content logic
- Content validation rules

**Note:** These are declarative descriptors, not executable code. They define rules and conditions but do not contain executable logic or code that runs in the game.

---

## 3. Pack File Format

### ZIP for Delivery

**Purpose:**
- Single file distribution
- Compression for smaller downloads
- Standard format with wide support
- Easy to validate and extract
- Supports nested directory structure

**Structure:**
- Root contains manifest and metadata files
- Content organized in subdirectories
- Assets in separate asset directories
- Optional scripts in scripts directory
- Flat or hierarchical organization

**Benefits:**
- Single file for distribution
- Compression reduces download size
- Standard format, easy to handle
- Supports directory structure
- Can be validated before extraction

### JSONL for Large Text Lists

**Purpose:**
- Efficient storage of large text lists
- One JSON object per line
- Streaming-friendly format
- Easy to parse incrementally
- Memory-efficient for large datasets

**Use Cases:**
- Large question lists (thousands of questions)
- Story chunk collections
- Lore fragment lists
- Item definition lists
- Event definition lists

**Benefits:**
- Efficient for large datasets
- Streaming parsing possible
- Memory-efficient
- Easy to append or update
- Human-readable format

### JSON for Metadata & Manifest

**Purpose:**
- Structured metadata storage
- Manifest file format
- Configuration and settings
- Pack information
- Schema definitions

**Use Cases:**
- Pack metadata file
- Manifest file
- Configuration files
- Schema definitions
- Dependency information

**Benefits:**
- Human-readable
- Easy to parse
- Standard format
- Supports nested structures
- Widely supported

### Conceptual Roles

**ZIP Container:**
- Delivery mechanism
- Compression and bundling
- Single file distribution
- Directory organization
- Asset packaging

**JSONL Content Files:**
- Large text content storage
- Efficient list storage
- Streaming-friendly
- Memory-efficient parsing
- Incremental processing

**JSON Metadata:**
- Structured information
- Configuration data
- Manifest information
- Schema definitions
- Human-readable format

---

## 4. Versioning Rules

### Pack Version

**Semantic Versioning:**
- Major version (breaking changes)
- Minor version (new content, backward compatible)
- Patch version (bug fixes, corrections)
- Example: `1.2.3`

**Version Rules:**
- Increment major for breaking changes
- Increment minor for new content
- Increment patch for fixes
- Version must be unique per pack
- Version history maintained

### Content Version

**Content Tracking:**
- Tracks content changes within pack
- Content version independent of pack version
- Allows content updates without pack version change
- Tracks content modification history
- Enables content-level versioning

**Use Cases:**
- Content corrections
- Content updates
- Content additions
- Content removals
- Content modifications

### Schema Version

**Schema Evolution:**
- Tracks pack schema version
- Enables schema evolution
- Backward compatibility tracking
- Schema migration support
- Version-specific validation

**Schema Rules:**
- Schema version independent of pack version
- Multiple schema versions supported
- Schema migration paths defined
- Schema validation per version
- Schema deprecation timeline

### Compatibility Rules

**Version Compatibility:**
- Pack version compatibility matrix
- Schema version compatibility
- Game version compatibility
- Dependency version compatibility
- Cross-pack compatibility

**Compatibility Checks:**
- Validate pack version compatibility
- Check schema version support
- Verify game version requirements
- Validate dependency versions
- Check cross-pack compatibility

### Deprecation Markers

**Deprecation Tracking:**
- Mark deprecated content items
- Deprecation timeline
- Replacement content references
- Migration guidance
- Removal schedule

**Deprecation Rules:**
- Deprecated content still loads
- Warnings for deprecated content
- Replacement content suggested
- Migration path provided
- Removal date specified

---

## 5. Loader Blueprint

### Validate Metadata

**Validation Steps:**
- Verify pack metadata structure
- Check required metadata fields
- Validate metadata format
- Verify pack identification
- Check metadata integrity

**Validation Rules:**
- Required fields present
- Field types correct
- Value ranges valid
- Format compliance
- Integrity checks pass

### Validate Schema Version

**Schema Validation:**
- Verify schema version support
- Check schema compatibility
- Validate against schema definition
- Verify schema version requirements
- Check schema migration needs

**Schema Rules:**
- Schema version must be supported
- Schema structure must match
- Required fields present
- Field types correct
- Schema rules enforced

### Read JSON/JSONL Inside ZIP

**Reading Process:**
- Extract ZIP archive
- Locate JSON metadata files
- Read JSONL content files
- Parse JSON structures
- Stream JSONL files if large

**Reading Strategy:**
- Validate ZIP structure first
- Read metadata files early
- Stream large JSONL files
- Parse JSON incrementally
- Handle errors gracefully

### Expose Pack Data via Typed Access

**Access Interface:**
- Type-safe content access
- Content type-specific accessors
- Query interface for content
- Filtering and searching
- Caching for performance

**Access Patterns:**
- Get content by ID
- Get content by type
- Query content by criteria
- Filter content by metadata
- Search content by text

### Support Multiple Packs

**Multi-Pack Management:**
- Load multiple packs simultaneously
- Track pack dependencies
- Manage pack activation state
- Handle pack conflicts
- Merge pack content

**Multi-Pack Rules:**
- Packs can be loaded together
- Dependencies resolved automatically
- Conflicts handled by priority
- Content merged appropriately
- Activation state managed per pack

### Allow Override/Merge Rules

**Override System:**
- Define override priorities
- Handle content conflicts
- Merge duplicate content
- Apply override rules
- Resolve conflicts automatically

**Override Rules:**
- Higher priority packs override lower
- Base packs have lowest priority
- DLC packs override base packs
- Seasonal packs override DLC packs
- User packs override all (if allowed)

---

## 6. Merging & Overrides

### Merging Multiple Packs

**Merge Process:**
- Combine content from multiple packs
- Resolve conflicts by priority
- Merge duplicate content appropriately
- Preserve pack identity
- Maintain content relationships

**Merge Rules:**
- Content merged by type
- Duplicates handled by priority
- Relationships preserved
- Metadata combined
- Conflicts resolved automatically

### Priority (Base vs DLC vs Seasonal)

**Priority Hierarchy:**
- Base packs (lowest priority)
- DLC packs (medium priority)
- Seasonal packs (high priority)
- User/community packs (highest priority, if allowed)

**Priority Rules:**
- Higher priority overrides lower
- Same priority: last loaded wins
- Priority can be explicit or implicit
- Priority conflicts resolved automatically
- Priority can be user-configurable

### Duplicate Entries

**Duplicate Handling:**
- Detect duplicate content by ID
- Resolve duplicates by priority
- Merge duplicate metadata
- Preserve highest priority version
- Log duplicate resolution

**Duplicate Rules:**
- Same content ID = duplicate
- Higher priority wins
- Metadata merged if compatible
- Relationships updated
- Warnings for duplicates

### Conflict Resolution

**Conflict Types:**
- Content ID conflicts
- Schema version conflicts
- Dependency conflicts
- Metadata conflicts
- Relationship conflicts

**Resolution Strategies:**
- Priority-based resolution
- Last-loaded wins (same priority)
- User intervention (if required)
- Automatic resolution (when possible)
- Conflict logging and reporting

### Disabled Entries

**Disabling Content:**
- Mark content as disabled
- Disabled content not loaded
- Disabled content can be re-enabled
- Disabled content preserved
- Disabled content tracked

**Disable Rules:**
- Content can be disabled per pack
- Disabled content skipped during load
- Disabled content can be enabled later
- Disabled state persisted
- Disabled content can be removed

---

## 7. Security & Safety

### Validate Schema

**Schema Validation:**
- Strict schema validation required
- Reject packs with invalid schema
- Verify schema version support
- Validate all content against schema
- Enforce schema rules strictly

**Validation Rules:**
- Schema must be valid
- All content must match schema
- Required fields must be present
- Field types must be correct
- Schema rules must be enforced

### Reject Malformed ZIP

**ZIP Validation:**
- Validate ZIP file structure
- Check ZIP integrity
- Verify ZIP can be extracted
- Reject corrupted ZIP files
- Validate ZIP contents

**Validation Rules:**
- ZIP must be valid format
- ZIP must be extractable
- ZIP contents must be accessible
- Corrupted ZIPs rejected
- Malformed ZIPs rejected

### Sandbox Pack Data

**Sandboxing:**
- Isolate pack data from system
- Prevent pack data from affecting system
- Validate all pack data access
- Restrict pack data operations
- Monitor pack data usage

**Sandbox Rules:**
- Pack data isolated
- No direct system access
- All access validated
- Operations restricted
- Usage monitored

### Whitelist Allowed Fields

**Field Whitelisting:**
- Define allowed fields per content type
- Reject unknown fields
- Enforce field whitelist strictly
- Validate field values
- Log rejected fields

**Whitelist Rules:**
- Only whitelisted fields allowed
- Unknown fields rejected
- Field values validated
- Whitelist per content type
- Whitelist enforced strictly

### No Executable Scripts

**Script Restrictions:**
- No executable code allowed
- Only declarative descriptors
- No JavaScript or other code
- No system commands
- No file system access

**Restrictions:**
- Packs cannot contain executable code
- Only declarative rules allowed
- No code execution
- No system access
- No file operations

---

## 8. Pack Lifecycle

### Installation

**Installation Process:**
- Download pack file
- Validate pack structure
- Extract pack contents
- Validate pack metadata
- Register pack in system

**Installation Rules:**
- Pack must be valid
- Dependencies must be met
- No conflicts with existing packs
- Installation can be rolled back
- Installation logged

### Activation

**Activation Process:**
- Enable pack for use
- Load pack content
- Merge with other active packs
- Resolve conflicts
- Make content available

**Activation Rules:**
- Pack must be installed
- Dependencies must be active
- Conflicts resolved automatically
- Activation can be toggled
- Activation state persisted

### Update

**Update Process:**
- Check for pack updates
- Download updated pack
- Validate update compatibility
- Apply updates
- Preserve user data

**Update Rules:**
- Updates must be compatible
- User data preserved
- Updates can be rolled back
- Update process logged
- Update notifications provided

### Disable/Remove

**Disable Process:**
- Deactivate pack
- Unload pack content
- Preserve pack files
- Update system state
- Log disable action

**Remove Process:**
- Uninstall pack
- Remove pack files
- Clean up references
- Update system state
- Log removal action

**Rules:**
- Disable preserves pack files
- Remove deletes pack files
- Dependencies checked
- Removal can be rolled back
- State changes logged

### Caching

**Cache Strategy:**
- Cache loaded pack data
- Cache parsed content
- Cache validation results
- Invalidate cache on update
- Cache pack metadata

**Cache Rules:**
- Cache for performance
- Invalidate on changes
- Cache pack-specific data
- Cache validation results
- Cache management automatic

---

## 9. Migration Strategy

### Step 1: Audit Existing Content
- Identify all existing content
- Catalog content by type
- Map content locations
- Document content structure
- Identify content dependencies
- Can run in parallel: Yes (multiple auditors)

### Step 2: Define Canonical Schema
- Design pack schema structure
- Define content type schemas
- Specify metadata schemas
- Document schema versioning
- Create schema validation rules
- Can run in parallel: No (requires Step 1)

### Step 3: Create Pack Prototype
- Build pack structure prototype
- Implement pack loader prototype
- Create pack validation prototype
- Test pack loading and merging
- Document pack format
- Can run in parallel: After Step 2

### Step 4: Migrate Initial Packs
- Create base content pack
- Migrate core content to pack
- Test pack loading and access
- Validate content integrity
- Update content references
- Can run in parallel: After Step 3

### Step 5: Migrate Seasonal Packs
- Create seasonal pack structure
- Migrate seasonal content
- Test seasonal pack loading
- Validate seasonal content
- Update seasonal content references
- Can run in parallel: After Step 4

### Step 6: Enforce Pack-Only Content Model
- Update content loading to use packs only
- Remove direct content file access
- Update content creation tools
- Document pack-only workflow
- Enforce pack validation
- Can run in parallel: After Step 5

### Step 7: Remove Legacy Inline Content
- Identify legacy inline content
- Migrate remaining inline content
- Remove legacy content files
- Update legacy content references
- Clean up legacy content code
- Can run in parallel: After Step 6

**Execution Order:**
- Steps 1-2: Serial (audit â†’ schema)
- Step 3: After Step 2 (prototype)
- Steps 4-5: Can run in parallel (base â†’ seasonal)
- Steps 6-7: Serial (enforce â†’ cleanup)

---

## 10. Risk Map

### Pack Incompatibility

**Risk:** Packs may be incompatible with each other or with game version

**Mitigation:**
- Strict compatibility checking
- Version compatibility matrix
- Dependency validation
- Schema version validation
- Clear error messages
- Compatibility testing
- Rollback capability

### Schema Drift

**Risk:** Schema may evolve inconsistently, causing validation failures

**Mitigation:**
- Versioned schema definitions
- Schema migration paths
- Backward compatibility rules
- Schema evolution guidelines
- Schema validation testing
- Schema documentation
- Deprecation timelines

### Missing Data Fields

**Risk:** Required fields may be missing, causing loading failures

**Mitigation:**
- Strict schema validation
- Required field checking
- Default value handling
- Field whitelisting
- Validation error reporting
- Migration tools
- Field requirement documentation

### Broken Merges

**Risk:** Merging multiple packs may fail or produce incorrect results

**Mitigation:**
- Comprehensive merge testing
- Conflict resolution testing
- Merge validation
- Merge logging
- Rollback capability
- Merge conflict reporting
- Merge documentation

### Content Pack Bloat

**Risk:** Packs may become too large, affecting performance

**Mitigation:**
- Pack size limits
- Content optimization
- Lazy loading strategies
- Pack splitting for large content
- Compression optimization
- Performance monitoring
- Size guidelines

### Data Loss During Migration

**Risk:** Content may be lost during migration to pack system

**Mitigation:**
- Comprehensive content audit
- Backup before migration
- Migration validation
- Content integrity checks
- Rollback procedures
- Migration logging
- Content verification

### Performance Degradation

**Risk:** Pack loading and merging may impact performance

**Mitigation:**
- Performance testing
- Caching strategies
- Lazy loading
- Incremental loading
- Performance monitoring
- Optimization guidelines
- Performance budgets

### Security Vulnerabilities

**Risk:** Malicious packs may exploit system vulnerabilities

**Mitigation:**
- Strict schema validation
- Field whitelisting
- No executable code
- Sandboxing pack data
- Security auditing
- Pack signing (optional)
- Security testing

---

## Summary

This plan establishes:
- Content pack definition with clear boundaries
- Pack structure blueprint (metadata, manifest, payload, assets, scripts)
- Pack file format strategy (ZIP, JSONL, JSON)
- Versioning rules (pack, content, schema, compatibility, deprecation)
- Loader blueprint with validation and access patterns
- Merging and override rules with priority system
- Security and safety safeguards
- Pack lifecycle management (install, activate, update, disable, cache)
- Migration strategy with 7 steps
- Risk map with mitigation strategies

Ready for review before implementation begins.
