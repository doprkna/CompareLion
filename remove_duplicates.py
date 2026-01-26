#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('packages/db/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences
compare_post_indices = []
idx = 0
while True:
    idx = content.find('model ComparePost', idx)
    if idx == -1:
        break
    compare_post_indices.append(idx)
    idx += 1

print(f'Found {len(compare_post_indices)} ComparePost models')

if len(compare_post_indices) > 1:
    # Find the end of the first ComparePost block (includes all three models)
    first_start = compare_post_indices[0]
    
    # Find where the CompareComment model ends
    compare_comment_end = content.find('  @@map("compare_comments")\n}', first_start)
    if compare_comment_end > 0:
        first_end = compare_comment_end + len('  @@map("compare_comments")\n}')
        
        # Remove the first occurrence (keep the second)
        new_content = content[:first_start] + content[first_end:]
        
        with open('packages/db/schema.prisma', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print('SUCCESS: Removed first duplicate set')
        print('Verification:')
        print('  ComparePost count:', new_content.count('model ComparePost'))
        print('  CompareReaction count:', new_content.count('model CompareReaction'))
        print('  CompareComment count:', new_content.count('model CompareComment'))
    else:
        print('ERROR: Could not find end of CompareComment model')
else:
    print('INFO: No duplicates found')


