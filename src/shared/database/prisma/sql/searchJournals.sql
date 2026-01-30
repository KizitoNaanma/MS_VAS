SELECT
    *
FROM
    "Journal"
WHERE
    to_tsvector('english', "body") @ @ to_tsquery($ 1)
    OR to_tsvector('english', "title") @ @ to_tsquery($ 1)
    OR "Journal"."title" ILIKE '%' || $ 1 || '%'
    OR "Journal"."body" ILIKE '%' || $ 1 || '%'
    AND "Journal"."createdById" = $ 2;