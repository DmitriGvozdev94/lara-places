<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use App\Models\IgnoreList;
use Illuminate\Support\Facades\Auth;


class LocationController extends Controller
{
    private $elasticsearchUrl = 'http://opensearch:9200'; // Replace with your actual OpenSearch/Elasticsearch endpoint
    private $indexName = 'places'; // Replace with your desired index name

    public function fetchAndIndexLocations(Request $request)
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        $radius = $request->input('radius');
        $tags = $request->input('tags', []); // Additional tags filter
        $size = $request->input('size', 10); // Number of results to return (default 10

        if (!$latitude || !$longitude || !$radius) {
            return response()->json(['error' => 'Invalid parameters'], 400);
        }

        try {
            $url = 'http://overpass-api.de/api/interpreter';
            $query = "[out:json];node[amenity=restaurant](around:{$radius},{$latitude},{$longitude});out;";
            $params = ['data' => $query];

            $response = Http::get($url, $params);

            if ($response->successful()) {
                $data = $response->json();
                $elements = $data['elements'] ?? [];

                // Call a method to index data into OpenSearch
                $this->indexDataToOpenSearch($elements);
                $results = $this->queryOpenSearch($latitude, $longitude, $radius, $tags, $size);
                return response()->json($results);

            } else {
                return response()->json(['error' => 'Failed to fetch data'], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch data', 'details' => $e->getMessage()], 500);
        }
    }

    private function indexDataToOpenSearch(array $documents)
    {
        try {
            $client = new Client();

            // Ensure the index exists or create it
            $this->createElasticsearchIndexIfNotExists($client);

            $bulkData = [];
            foreach ($documents as $doc) {
                // Add a geo_point and timestamp
                $documentWithGeoPoint = array_merge($doc, [
                    'location' => ['lat' => $doc['lat'], 'lon' => $doc['lon']], // Adding the geo_point
                    'timestamp' => now()->toIso8601String(), // Add the current ISO timestamp
                ]);

                $bulkData[] = json_encode(['index' => ['_index' => $this->indexName, '_id' => $doc['id']]]);
                $bulkData[] = json_encode($documentWithGeoPoint);
            }

            $response = $client->post(
                "{$this->elasticsearchUrl}/_bulk",
                [
                    'headers' => ['Content-Type' => 'application/x-ndjson'],
                    'body' => implode("\n", $bulkData) . "\n",
                ]
            );

            if ($response->getStatusCode() === 200) {
                \Log::info("Successfully indexed " . count($documents) . " documents");
            } else {
                \Log::error("Error indexing data: " . $response->getStatusCode() . " - " . $response->getReasonPhrase());
            }
        } catch (RequestException $e) {
            \Log::error('Error indexing data to OpenSearch: ' . $e->getMessage());
        }
    }

    private function createElasticsearchIndexIfNotExists(Client $client)
    {
        try {
            $response = $client->head("{$this->elasticsearchUrl}/{$this->indexName}");

            if ($response->getStatusCode() === 404) {
                // Index does not exist, create it
                $client->put("{$this->elasticsearchUrl}/{$this->indexName}", [
                    'json' => [
                        'mappings' => [
                            'properties' => [
                                'id' => ['type' => 'integer'],
                                'location' => ['type' => 'geo_point'], // Create the geo_point field
                                'tags' => ['type' => 'object'],
                                'timestamp' => ['type' => 'date'],
                            ],
                        ],
                    ],
                ]);

                \Log::info("Created Elasticsearch index: {$this->indexName}");
            }
        } catch (RequestException $e) {
            \Log::error('Error checking/creating Elasticsearch index: ' . $e->getMessage());
        }
    }

    private function queryOpenSearch($latitude, $longitude, $radius, $tags, $size = 10)
    {
        try {
            $client = new Client();
            $ignoreList = IgnoreList::where('user_id', Auth::id())->pluck('item_id')->toArray();

            $query = [
                'bool' => [
                    'must' => [
                        [
                            'geo_distance' => [
                                'distance' => "{$radius}m",
                                'location' => [
                                    'lat' => $latitude,
                                    'lon' => $longitude,
                                ],
                            ],
                        ],
                    ],
                    'must_not' => [
                        [
                            'terms' => [
                                'id' => $ignoreList,
                            ],
                        ],
                    ],
                    'filter' => [],
                ],
            ];

            if (is_array($tags) && count(array_filter($tags)) > 0) {
                $query['bool']['should'][] = [
                    'multi_match' => [
                        'query' => implode(' ', $tags),
                        'fields' => [
                            'tags.amenity',
                            'tags.cuisine',
                            'tags.name',
                            'tags.brand',
                        ],
                    ],
                ];
                $query['bool']['minimum_should_match'] = 1;
            }

            $response = $client->post("{$this->elasticsearchUrl}/{$this->indexName}/_search", [
                'json' => [
                    'size' => $size,
                    'query' => $query,
                ],
            ]);

            if ($response->getStatusCode() === 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                return $data['hits']['hits'] ?? [];
            } else {
                \Log::error("Error querying OpenSearch: " . $response->getStatusCode() . " - " . $response->getReasonPhrase());
                return [];
            }
        } catch (RequestException $e) {
            \Log::error('Error querying OpenSearch: ' . $e->getMessage());
            return [];
        }
    }
}
