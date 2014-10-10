USE giec

SELECT
  chapters.number AS `#`,
  chapters.title AS `Title`,
  roles.name AS `Role`,
  authors.id AS `Author ID`,
  CONCAT(
    authors.first_name,
    ' ',
    authors.last_name
  ) AS `Name`,
  institutions.name AS `Institution`,
  "" AS `Citizenship`,
  countries.name AS `Affiliation Country`
FROM
  chapters
  JOIN participations
  ON chapters.ar = participations.ar
  AND chapters.wg = participations.wg
  AND chapters.number = participations.chapter
  JOIN roles
  ON roles.symbol = participations.role
  JOIN authors
  ON authors.id = participations.author_id
  JOIN institution_countries
  ON institution_countries.id = participations.institution_country_id
  JOIN institutions
  ON institutions.id = institution_countries.institution_id
  JOIN countries
  ON countries.id = institution_countries.country_id
WHERE
      participations.ar = 5
  AND participations.wg = 3
ORDER BY
  chapters.id,
  roles.rank,
  authors.last_name,
  authors.first_name
\G
