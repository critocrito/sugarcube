# Example Queries

## Find all units by `_sc_id_hash`

```json
{
  "query": {
    "ids": {
      "values": [
        "f5b8babc6f4f874a26df1189a4dbfd4fb0c2898a3c702ca6c0e95d370ff50381",
        "c6da75782e121a178f1715613c94bf6ecec72f39295de54d8f9f54a6ab276632"
      ]
    }
  }
}
```

## Find all units with a certain date range

The following query fetches units that were either created in February 2018 or
fetched in the last five minutes.

```json
{
  "query": {
    "bool": {
      "should": [{
        "range" : {
          "$sc_pubdates.source" : {
            "gte" : "2018-02-01",
            "lt" :  "2018-02-26",
            "format": "YYYY-MM-dd"
          }
        }
      }, {
        "range" : {
          "$sc_pubdates.fetch" : {
            "gte" : "now-5m",
            "lt" :  "now"
          }
        }
      }]
    }
  }
}
```
