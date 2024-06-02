<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IgnoreList;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use GuzzleHttp\Client;


class IgnoreListController extends Controller
{
    private $elasticsearchUrl = 'http://opensearch:9200';
    private $indexName = 'places';

    public function index()
    {
        $ignoredItems = IgnoreList::where('user_id', Auth::id())->pluck('item_id')->toArray();
        $itemDetails = $this->fetchItemsFromOpenSearch($ignoredItems);

        return inertia('IgnoreList', ['ignoredItems' => $itemDetails]);
    }

    public function destroy($itemId)
    {
        try {
            $userId = Auth::id();
            $ignoreItem = IgnoreList::where('user_id', $userId)->where('item_id', $itemId)->first();

            if (!$ignoreItem) {
                return response()->json(['error' => 'Item not found in ignore list'], 404);
            }

            $ignoreItem->delete();

            return response()->json(['message' => 'Item removed from ignore list'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to remove item from ignore list',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function store(Request $request)
    {
        try {
            $ignoreList = IgnoreList::create([
                'user_id' => Auth::id(),
                'item_id' => $request->item_id,
            ]);

            return response()->json($ignoreList, 201);
        } catch (QueryException $e) {
            // Log the error message if necessary
            // \Log::error($e->getMessage());

            return response()->json([
                'error' => 'Failed to add item to ignore list',
                'message' => $e->getMessage(),
            ], 400);
        }
    }
    private function fetchItemsFromOpenSearch(array $itemIds)
    {
        $client = new Client();
        $itemsWithDetails = [];
    
        try {
            $query = [
                'query' => [
                    'terms' => [
                        'id' => $itemIds,
                    ],
                ],
            ];
    
            $response = $client->post("{$this->elasticsearchUrl}/{$this->indexName}/_search", [
                'json' => $query,
            ]);
    
            if ($response->getStatusCode() === 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                $hits = $data['hits']['hits'] ?? [];
    
                // Map item details with item_id
                foreach ($hits as $hit) {
                    $itemDetails = $hit['_source'];
                    $itemDetails['item_id'] = $hit['_source']['id']; // Ensure item_id is included
                    $itemsWithDetails[] = $itemDetails;
                }
    
                return $itemsWithDetails;
            } else {
                \Log::error("Error querying OpenSearch: " . $response->getStatusCode() . " - " . $response->getReasonPhrase());
                return [];
            }
        } catch (\Exception $e) {
            \Log::error('Error querying OpenSearch: ' . $e->getMessage());
            return [];
        }
    }
    
}
