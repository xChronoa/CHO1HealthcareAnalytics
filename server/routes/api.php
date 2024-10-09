<?php

use App\Http\Controllers\AgeCategoryController;
use App\Http\Controllers\M1_Report\IndicatorController;
use App\Http\Controllers\M1_Report\ServiceDataController;
use App\Http\Controllers\M2_Report\DiseaseController;
use App\Http\Controllers\ReportStatusController;
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
    Route::get("/wra-reports/", [WomenOfReproductiveAgeController::class, "getWomenOfReproductiveAges"]);
    Route::get("/family-planning-reports", [FamilyPlanningReportController::class, "getFamilyPlanningReports"]);
    Route::get("/service-data-reports/{service_name}", [ServiceDataController::class, "getServiceDataReports"]);
    Route::get("/morbidity-reports/", [MorbidityReportController::class, "getMorbidityReports"]);
    

    // Filtered Report by Month and Barangay
    Route::get("/service-data-reports/", [ServiceDataController::class, "getFilteredServiceDataReports"]);
    Route::post("/morbidity-reports/filtered", [MorbidityReportController::class, "getFilteredMorbidityReports"]);
    
    
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

            // Build the user response array
            $response = [
                'authenticated' => true,
                'role' => $user->role,
            ];

            // Include barangay information if it exists
            if ($user->barangay) {
                $response['barangay_name'] = $user->barangay->barangay_name;
            }

            return response()->json(
                $response
            );
        }
    } else {
        return response()->json(['authenticated' => false], 200);
    }
});
