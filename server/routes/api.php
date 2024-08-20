<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


// Public routes
Route::post('/login', [UserController::class, 'login'])->name('login');

// Protected routes for authenticated users
Route::middleware(['auth:sanctum'])->group(function () {
    // User routes
    Route::get('/users', [UserController::class, 'index']);              // Get all users
    Route::post('/users', [UserController::class, 'store']);             // Create a new user
    Route::get('/users/{id}', [UserController::class, 'show']);          // Get a specific user by ID
    Route::put('/users/{id}', [UserController::class, 'update']);        // Update a specific user by ID
    Route::delete('/users/{id}', [UserController::class, 'destroy']);    // Delete a specific user by ID

    // Get the authenticated user's details
    Route::get('/user', [UserController::class, 'user']);
    
    // Logout route
    Route::post('/logout', [UserController::class, 'logout']);
});
