 # "create index json_idx on data(JSON_EXTRACT(json, '$._source.sourceResource.date.end'));"
 
def extract(field, return_as):
    return "JSON_EXTRACT(json, '$._source.{field}') AS {return_as}".format(field=field, return_as=return_as)
    
def case_statement(field, return_as):
    case_statement = """CASE       
              WHEN JSON_EXTRACT(json, '$._source.{field}[0]') IS NOT NULL
              THEN JSON_EXTRACT(json, '$._source.{field}[0]')
              ELSE JSON_EXTRACT(json, '$._source.{field}')
              END
              AS {return_as}""".format(field=field, return_as=return_as)
    return case_statement

def __main__():
    cases_list = [
        extract('sourceResource.date.end', 'when_end'),
        extract('sourceResource.date.displayDate', 'when_original'),        
        case_statement('sourceResource.title', 'title'),
        case_statement('object', 'object'),
        case_statement('dataProvider', 'source'),
        case_statement('isShownAt', 'url'),
        case_statement('@id', 'id')        
    ]
    
    cases = ",\n\t".join(cases_list)

    query = """
.mode line
SELECT 
   
    {}
FROM DATA LIMIT 100000;
""".format(cases,)
    print(query)


__main__()
