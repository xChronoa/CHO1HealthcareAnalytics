<?php

use App\Http\Controllers\AgeCategoryController;
use App\Http\Controllers\M1_Report\IndicatorController;
use App\Http\Controllers\M1_Report\ServiceDataController;
use App\Http\Controllers\M2_Report\DiseaseController;
use App\Http\Controllers\ReportStatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\ModelNotFoundException;

// Personal Access Token
use Laravel\Sanctum\PersonalAccessToken;

// Controllers
use App\Http\Controllers\Appointment\AppointmentCategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\Appointment\PatientController;
use App\Http\Controllers\Appointment\AppointmentController;
use App\Http\Controllers\M1_Report\FamilyPlanningMethodsController;
use App\Http\Controllers\M1_Report\FamilyPlanningReportController;
use App\Http\Controllers\M1_Report\ServiceController;
use App\Http\Controllers\M1_Report\WomenOfReproductiveAgeController;
use App\Http\Controllers\M2_Report\MorbidityReportController;
use App\Http\Controllers\ReportSubmissionController;

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
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);              // Get all users
        Route::post('/', [UserController::class, 'store']);             // Create a new user
        Route::get('/{id}', [UserController::class, 'show']);          // Get a specific user by ID
        Route::put('/{id}', [UserController::class, 'update']);        // Update a specific user by ID
        Route::put('/disable/{id}', [UserController::class, 'disable']);    // Disable a specific user by ID
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
        Route::get('/{id}', [PatientController::class, 'getCount']); // Retrieve a specific patient
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
        Route::get('/count', [AppointmentController::class, 'getCount']);
        Route::get('/category/{category_name}', [AppointmentController::class, 'patientsForCategory']);
    });

    Route::prefix("submissions")->group(function () {
        Route::post("/", [ReportSubmissionController::class, 'createReportSubmissions']);
        Route::post("/month-year", [ReportSubmissionController::class, 'fetchReportSubmissionsByFilter']);
        Route::get("/min-max", [ReportSubmissionController::class, 'fetchEarliestAndLatestReportSubmissionDates']);
        Route::get("/pending", [ReportSubmissionController::class, 'fetchCountOfPendingBarangayReports']);
        Route::get("/barangay-reports", [ReportSubmissionController::class, 'fetchReportSubmissionsForBarangay']);
    });

    Route::prefix("statuses")->group(function () {
        Route::post("/submit/report", [ReportStatusController::class, 'submitReport']);
        Route::post("/report-status/", [ReportStatusController::class, 'filterReportStatuses']);
        Route::post("/min-max/", [ReportStatusController::class, 'fetchEarliestAndLatestReportStatusesDates']);
    });

    Route::prefix("diseases")->group(function() {
        Route::get("/", [DiseaseController::class, 'index']);
    });

    Route::prefix("age-categories")->group(function() {
        Route::get("/", [AgeCategoryController::class, "index"]);
    });

    Route::prefix("indicator")->group(function() {
        Route::get('/', [IndicatorController::class, 'index']);
        Route::get('/{name}', [IndicatorController::class, 'getIndicatorFromServiceName']);
    });
    
    Route::get('/fp-method', [FamilyPlanningMethodsController::class, 'index']);

    Route::prefix("services")->group(function () {
        Route::get("/", [ServiceController::class, 'index']);
        Route::get("/{service_name}", [ServiceController::class, "show"]);
    });

    // Dashboard
    Route::post("/wra-reports/", [WomenOfReproductiveAgeController::class, "getWomenOfReproductiveAges"]);
    Route::post("/family-planning-reports", [FamilyPlanningReportController::class, "getFamilyPlanningReports"]);
    Route::post("/service-data-reports/{service_name}", [ServiceDataController::class, "getServiceDataReports"]);
    Route::post("/morbidity-reports/", [MorbidityReportController::class, "getMorbidityReports"]);
    

    // Filtered Report by Month and Barangay
    Route::post("/service-data-reports/", [ServiceDataController::class, "getFilteredServiceDataReports"]);
    Route::post("/wra-reports/filtered", [WomenOfReproductiveAgeController::class, "getFilteredWomenOfReproductiveAges"]);
    Route::post("/family-planning-reports/filtered", [FamilyPlanningReportController::class, "getFilteredFamilyPlanningReports"]);
    Route::post("/morbidity-reports/filtered", [MorbidityReportController::class, "getFilteredMorbidityReports"]);
    Route::post("/m1-report", [ReportStatusController::class, 'getFilteredM1Reports']);
    
    
    // Route for logging out an authenticated user
    Route::post('logout', [UserController::class, 'logout']);
});

/**
 * Public route to check if the user is authenticated.
 */
Route::get('/auth/check', function (Request $request) {
    // Retrieve the 'cho_session' cookie from the request
    $token = $request->cookie('cho_session');

    // Check if the token exists
    if (!$token) {
        return response()->json(['message' => 'Please log in to continue.', 'status' => "not_logged"], 401);
    }

    try {
        // Attempt to find the token in the database
        $tokenRecord = PersonalAccessToken::findToken(decrypt($token));

        // Check if the token is found
        if (!$tokenRecord) {
            return response()->json(['message' => 'Your session has expired. Please log in again.'], 401)
                            ->withCookie(cookie('cho_session', null, -1, '/', 'localhost', false, true, true, 'lax'));
        }

        // Token is valid; retrieve the associated user
        $user = $tokenRecord->tokenable;

        // Check if the user is disabled
        if ($user->status === 'disabled') {
            // Clear the cookie to log out the user
            return response()->json(['message' => 'Your account has been disabled. Please contact support for assistance.'])
                            ->withCookie(cookie('cho_session', null, -1, '/', 'localhost', false, true, true, 'lax'));
        }

        // Build the response array
        $response = [
            'role' => $user->role,
            // Include barangay information if available
            'barangay_name' => optional($user->barangay)->barangay_name,
        ];

        return response()->json($response);
        
    } catch (ModelNotFoundException $e) {
        // Handle case where token does not correspond to a user
        return response()->json(['message' => 'User not found. Please log in again.'], 404);
    } catch (\Exception $e) {
        // Handle any unexpected errors
        return response()->json(['message' => 'An unexpected error occurred. Please try again later.'], 500);
    }
});
