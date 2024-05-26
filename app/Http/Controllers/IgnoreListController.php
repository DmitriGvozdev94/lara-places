<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IgnoreList;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class IgnoreListController extends Controller
{
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
}
