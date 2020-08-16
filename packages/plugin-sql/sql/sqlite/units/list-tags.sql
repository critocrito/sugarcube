SELECT t.label,
       t.description,
       t.created_at,
       t.updated_at
  FROM tagged_unit tu
  JOIN query_tag t ON tu.query_tag = t.id
 WHERE tu.unit = $unitId;
