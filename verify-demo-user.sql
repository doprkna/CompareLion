-- Verify demo user was created correctly
SELECT 
  id,
  email,
  name,
  LEFT("passwordHash", 20) as password_prefix,
  "emailVerified" IS NOT NULL as has_email_verified,
  "emailVerifiedAt" IS NOT NULL as has_email_verified_at,
  xp,
  level,
  funds,
  diamonds,
  theme,
  motto,
  score,
  "questionsAnswered",
  "createdAt"
FROM users 
WHERE email = 'demo@example.com';



