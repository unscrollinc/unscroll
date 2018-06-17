.mode column
SELECT 

       CASE       
              WHEN JSON_EXTRACT(json, '$._source.sourceResource.title[0]') IS NOT NULL
              THEN JSON_EXTRACT(json, '$._source.sourceResource.title[0]')
              ELSE JSON_EXTRACT(json, '$._source.sourceResource.title')
              END
              AS title,

       JSON_EXTRACT(json, '$._source.isShowAt') as when_original,

              
       CASE       
              WHEN JSON_EXTRACT(json, '$._source.object[0]') IS NOT NULL
              THEN JSON_EXTRACT(json, '$._source.object[0]')
              ELSE JSON_EXTRACT(json, '$._source.object')
              END
              AS thumbnail_url

FROM DATA LIMIT 10000;
