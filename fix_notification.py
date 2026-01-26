#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('packages/db/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Find Notification model
notification_start = content.find('model Notification {')
if notification_start == -1:
    print('ERROR: Notification model not found')
    exit(1)

# Find the end
notification_end = content.find('\n\n', notification_start + 100)
if notification_end == -1:
    notification_end = content.find('\n\nenum ', notification_start)
if notification_end == -1:
    notification_end = len(content)

notification_model = content[notification_start:notification_end]

# Check for duplicate User relation
if '  User      User' in notification_model and '  user      User' in notification_model:
    # Remove the duplicate "User" field (keep "user")
    lines = notification_model.split('\n')
    new_lines = []
    skip_next = False
    for i, line in enumerate(lines):
        if skip_next:
            skip_next = False
            continue
        if line.strip().startswith('User      User') and i > 0 and 'user      User' in '\n'.join(lines[:i]):
            # Skip this duplicate User field
            continue
        new_lines.append(line)
    
    notification_model = '\n'.join(new_lines)
    
    # Replace in content
    new_content = content[:notification_start] + notification_model + content[notification_end:]
    
    with open('packages/db/schema.prisma', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print('SUCCESS: Removed duplicate User field from Notification model')
else:
    print('INFO: No duplicate User field found')


