#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# Read the schema file
with open('packages/db/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix patterns like "String`n  slot            String??" -> "String?"
content = re.sub(r'(\w+)\s+String`n\s+slot\s+String\?\?', r'\1 String?', content)
content = re.sub(r'(\w+)\s+String`n\s+slot\s+String\?', r'\1 String?', content)

# Fix patterns like "description String?`n  region          String?" -> proper two lines
content = re.sub(r'(description)\s+String\?`n\s+region\s+String\?', r'\1 String?\n  region          String?', content)

# Fix patterns like "inventoryItems InventoryItem[]`n  userItems       UserItem[]`n  userItems       UserItem[]"
content = re.sub(r'inventoryItems\s+InventoryItem\[\]`n\s+userItems\s+UserItem\[\]`n\s+userItems\s+UserItem\[\]', 
                 'inventoryItems  InventoryItem[]\n  userItems       UserItem[]', content)

# Fix patterns like "isShopItem Boolean @default(false)`n  isTradable Boolean @default(true)"
content = re.sub(r'isShopItem\s+Boolean\s+@default\(false\)`n\s+isTradable\s+Boolean\s+@default\(true\)',
                 'isShopItem      Boolean         @default(false)\n  isTradable      Boolean         @default(true)', content)

# Write back
with open('packages/db/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed schema file')

