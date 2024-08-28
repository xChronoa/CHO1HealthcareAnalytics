<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Personal Access Token
use Laravel\Sanctum\PersonalAccessToken;

// Controllers
use App\Http\Controllers\Appointment\AppointmentCategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\Appointment\PatientController;
use App\Http\Controllers\Appointment\AppointmentController;


/**
 * Public Routes
 */
Route::post('login', [UserController::class, 'login'])->name('login');
Route::get('appointment-categories', [AppointmentCategoryController::class, 'index']);
Route::post('appointments', [AppointmentController::class, 'store']);


/**
 * Protected routes for authenticated users
 */
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User controller
    Route::prefix('users')->group(function() { 
        Route::get('/', [UserController::class, 'index']);              // Get all users
        Route::post('/', [UserController::class, 'store']);             // Create a new user
        Route::get('/{id}', [UserController::class, 'show']);          // Get a specific user by ID
        Route::put('/{id}', [UserController::class, 'update']);        // Update a specific user by ID
        Route::delete('/{id}', [UserController::class, 'disable']);    // Disable a specific user by ID
    });
    Route::get('/user', [UserController::class, 'user']);               // Get the authenticated user's details


    // Barangay controller
    Route::prefix('barangays')->group(function () {
        Route::get('/', [BarangayController::class, 'index']);
        Route::post('/', [BarangayController::class, 'store']);
        Route::get('/{id}', [BarangayController::class, 'show']);
        Route::put('/{id}', [BarangayController::class, 'update']);
        Route::delete('/{id}', [BarangayController::class, 'destroy']);
    });


    // Patient controller
    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index']); // List all patients
        Route::post('/', [PatientController::class, 'store']); // Create a new patient
        Route::get('/{id}', [PatientController::class, 'show']); // Retrieve a specific patient
        Route::put('/{id}', [PatientController::class, 'update']); // Update a specific patient
        Route::delete('/{id}', [PatientController::class, 'destroy']); // Delete a specific patient
    });

    // Appointment controller
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        
        // Route::get('/{id}', [AppointmentController::class, 'show']);
        Route::put('/{id}', [AppointmentController::class, 'update']);
        Route::delete('/{id}', [AppointmentController::class, 'destroy']);
        Route::get('/patients', [AppointmentController::class, 'allPatientsWithAppointments']);
        Route::get('/category/{category_name}', [AppointmentController::class, 'patientsForCategory']);
    });


    // Route for logging out an authenticated user
    Route::post('logout', [UserController::class, 'logout']);
});


/**
 * Public route to check if user is authenticated
 */
Route::get('/auth/check', function (Request $request) {
    // Check if the 'auth_token' cookie exists
    $token = $request->cookie('auth_token');

    // Set the Authorization header with the token if it exists
    if ($token) {
        // Find the token in the database
        $tokenRecord = PersonalAccessToken::findToken($token);

        if ($tokenRecord) {
            // Token exists, retrieve the user associated with the token
            $user = $tokenRecord->tokenable;

            return response()->json([
                'authenticated' => true,
                'role' => $user->role,
            ]);
        }
    } else {
        return response()->json(['authenticated' => false], 200);
    }
});
