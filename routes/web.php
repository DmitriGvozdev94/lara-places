<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IgnoreListController;
use Inertia\Inertia;

Route::get('/ignore-list', [IgnoreListController::class, 'index'])->name('ignore-list');

Route::middleware('auth:sanctum')->delete('/ignore-list/{itemId}', [IgnoreListController::class, 'destroy'])->name('ignore-list.destroy');

Route::middleware('auth:sanctum')->post('/ignore-list', [IgnoreListController::class, 'store']);

Route::post('/fetch-locations', [LocationController::class, 'fetchAndIndexLocations']);

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
