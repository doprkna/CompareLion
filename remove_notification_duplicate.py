#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('packages/db/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Find Notification model occurrences
notification_indices = []
idx = 0
while True:
    idx = content.find('model Notification', idx)
    if idx == -1:
        break
    notification_indices.append(idx)
    idx += 1

print(f'Found {len(notification_indices)} Notification models')

if len(notification_indices) > 1:
    # Find the end of the first Notification model
    first_start = notification_indices[0]
    
    # Find where the Notification model ends (look for closing brace and next model/enum)
    notification_end = content.find('\n\n', first_start)
    if notification_end > 0:
        # Check if next is enum or model
        next_line = content[notification_end+2:notification_end+20]
        if 'enum ' in next_line or 'model ' in next_line:
            first_end = notification_end + 2
            
            # Remove the first occurrence (keep the second)
            new_content = content[:first_start] + content[first_end:]
            
            with open('packages/db/schema.prisma', 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print('SUCCESS: Removed first Notification duplicate')
            print('Verification:')
            print('  Notification count:', new_content.count('model Notification'))
        else:
            # Try finding the closing brace
            brace_end = content.find('}\n\n', first_start)
            if brace_end > 0:
                first_end = brace_end + 3
                new_content = content[:first_start] + content[first_end:]
                with open('packages/db/schema.prisma', 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('SUCCESS: Removed first Notification duplicate (method 2)')
                print('  Notification count:', new_content.count('model Notification'))
            else:
                print('ERROR: Could not find end of Notification model')
    else:
        print('ERROR: Could not find end of first Notification model')
else:
    print('INFO: No Notification duplicates found')


