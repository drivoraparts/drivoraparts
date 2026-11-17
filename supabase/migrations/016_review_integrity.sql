-- Review integrity, step 1.
--
-- 1. New reviews are held for moderation by default.
--    Both insert paths in lib/reviews/store.ts already write status 'pending',
--    but the column default was 'approved', so any insert that did not name a
--    status -- a script, a SQL editor session, a future code path -- published
--    immediately. The default now matches the code.
--
-- 2. No stock photos beside real reviews.
--    Reviews used to be saved with profile_image '/reviews/avatars/NN.jpg',
--    stock photos of strangers downloaded for the removed review generator.
--    The files are gone; clear the paths so no row points at them. The site
--    shows the reviewer's initials instead. (lib/reviews/store.ts also ignores
--    these paths when reading, so the site is correct before this runs.)
--
-- Safe to run more than once.

ALTER TABLE product_reviews
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE product_reviews
  SET profile_image = NULL
  WHERE profile_image LIKE '/reviews/avatars/%';
