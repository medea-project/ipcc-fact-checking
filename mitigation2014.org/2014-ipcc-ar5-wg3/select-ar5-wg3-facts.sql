USE ipcc_facts

SET @commit='d392e75';
SET @source='mitigation2014.org';
SET @document='2014-ipcc-ar5-wg3';
SET @except_dataset='all-authors';

SELECT
  numbers.dataset,
  numbers.line,
  numbers.value AS `Chapter`,
  IFNULL(titles.value,"") AS `Title`,
  IFNULL(roles.value,"") AS `Role`,
  IFNULL(names.value,"") AS `Name`,
  COALESCE(
    institutions.value,
    profiles.organization,
    ""
  ) AS `Institution`,
  COALESCE(
    citizenships.value,
    profiles.citizenship,
    ""
  ) AS `Citizenship`,
  COALESCE(
    countries.value,
    profiles.affiliation,
    ""
  ) AS `Affiliation Country`
FROM
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Chapter'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) numbers
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Title'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) titles
  USING (dataset, line)
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Role'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) roles
  USING (dataset, line)
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Name'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) names
  USING (dataset, line)
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Institution'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) institutions
  USING (dataset, line)
  LEFT JOIN
  (
    SELECT DISTINCT
      profile_names.value AS name,
      profile_organizations.value AS organization,
      profile_affiliations.value AS affiliation,
      profile_citizenships.value AS citizenship
    FROM
      (
        SELECT dataset, line, value
        FROM facts
        WHERE name='Name'
        AND commit=@commit
        AND source=@source
        AND document=@document
        AND dataset LIKE '%-profile'
      ) profile_names
      LEFT JOIN
      (
        SELECT dataset, line, value
        FROM facts
        WHERE name='Organization'
        AND commit=@commit
        AND source=@source
        AND document=@document
        AND dataset LIKE '%-profile'
      ) profile_organizations
      USING (dataset, line)
      LEFT JOIN
      (
        SELECT dataset, line, value
        FROM facts
        WHERE name='Affiliation'
        AND commit=@commit
        AND source=@source
        AND document=@document
        AND dataset LIKE '%-profile'
      ) profile_affiliations
      USING (dataset, line)
      LEFT JOIN
      (
        SELECT dataset, line, value
        FROM facts
        WHERE name='Citizenship'
        AND commit=@commit
        AND source=@source
        AND document=@document
        AND dataset LIKE '%-profile'
      ) profile_citizenships
      USING (dataset, line)
    GROUP BY name
  ) profiles
  ON names.value = profiles.name
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Citizenship'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) citizenships
  USING (dataset, line)
  LEFT JOIN
  (
    SELECT dataset, line, value
    FROM facts
    WHERE name='Affiliation Country'
    AND commit=@commit
    AND source=@source
    AND document=@document
    AND dataset<>@except_dataset
    AND line>1
  ) countries
  USING (dataset, line)
ORDER BY
  numbers.dataset,
  numbers.line
\G
