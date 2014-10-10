USE ipcc_facts

SET @commit='4f7b157';
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
  IFNULL(institutions.value,"") AS `Institution`,
  IFNULL(citizenships.value,"") AS `Citizenship`,
  IFNULL(countries.value,"") AS `Affiliation Country`
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
