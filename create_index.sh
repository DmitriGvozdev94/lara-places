curl -X PUT "http://opensearch:9200/places" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "id": { "type": "integer" },
      "location": { "type": "geo_point" },
      "tags": { "type": "object" },
      "timestamp": { "type": "date" }
    }
  }
}
'
