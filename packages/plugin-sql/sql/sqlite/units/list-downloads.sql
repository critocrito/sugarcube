SELECT id_hash,
       type,
       term,
       md5,
       sha256,
       location,
       data
  FROM download
 WHERE unit = $unitId;
