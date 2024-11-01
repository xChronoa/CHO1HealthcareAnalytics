<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\ModelNotFoundException;

// Sanctum
use Laravel\Sanctum\PersonalAccessToken;

// User Management
use App\Http\Controllers\UserController;

// Barangay Management
use App\Http\Controllers\BarangayController;

// Appointment Management
use App\Http\Controllers\Appointment\AppointmentController;
use App\Http\Controllers\Appointment\PatientController;
use App\Http\Controllers\Appointment\AppointmentCategoryController;

// M1 Report Controllers
use App\Http\Controllers\M1_Report\FamilyPlanningMethodsController;
use App\Http\Controllers\M1_Report\FamilyPlanningReportController;
use App\Http\Controllers\M1_Report\ServiceController;
use App\Http\Controllers\M1_Report\ServiceDataController;
use App\Http\Controllers\M1_Report\IndicatorController;
use App\Http\Controllers\M1_Report\WomenOfReproductiveAgeController;

// M2 Report Controllers
use App\Http\Controllers\M2_Report\DiseaseController;
use App\Http\Controllers\M2_Report\MorbidityReportController;

// Report Submission and Status Controllers
use App\Http\Controllers\ReportSubmissionController;
use App\Http\Controllers\ReportStatusController;

// Miscellaneous
use App\Http\Controllers\AgeCategoryController;


/**
 * Public Routes
 */
Route::post('login', [UserController::class, 'login'])->name('login');
Route::get('appointment-categories', [AppointmentCategoryController::class, 'index']);
Route::post('appointments', [AppointmentController::class, 'store']);

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

/**
 * Protected Routes for Authenticated Users
 */
Route::middleware(['auth:sanctum'])->group(function () {

    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);            // List all users
        Route::post('/', [UserController::class, 'store']);           // Create a new user
        Route::get('/{id}', [UserController::class, 'show']);         // Get a specific user by ID
        Route::put('/{id}', [UserController::class, 'update']);       // Update a specific user by ID
        Route::put('/disable/{id}', [UserController::class, 'disable']); // Disable a specific user by ID
    });
    Route::get('/user', [UserController::class, 'user']);             // Get authenticated user details
    Route::post('logout', [UserController::class, 'logout']);         // Logout the authenticated user

    // Barangay Management
    Route::prefix('barangays')->group(function () {
        Route::get('/', [BarangayController::class, 'index']);        // List all barangays
        Route::post('/', [BarangayController::class, 'store']);       // Create a new barangay
        Route::get('/{id}', [BarangayController::class, 'show']);     // Get specific barangay by ID
        Route::put('/{id}', [BarangayController::class, 'update']);   // Update specific barangay
        Route::delete('/{id}', [BarangayController::class, 'destroy']); // Delete specific barangay
    });

    // Patient Management
    Route::prefix('patients')->group(function () {
        Route::get('/count', [PatientController::class, 'getCount']); // Get patient count
        Route::get('/', [PatientController::class, 'index']);         // List all patients
        Route::post('/', [PatientController::class, 'store']);        // Create a new patient
        Route::get('/{id}', [PatientController::class, 'show']);      // Retrieve specific patient
        Route::put('/{id}', [PatientController::class, 'update']);    // Update specific patient
        Route::delete('/{id}', [PatientController::class, 'destroy']); // Delete specific patient
    });

    // Appointment Management
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);          // List all appointments
        Route::put('/{id}', [AppointmentController::class, 'update']);     // Update specific appointment
        Route::delete('/{id}', [AppointmentController::class, 'destroy']); // Delete specific appointment
        Route::get('/patients', [AppointmentController::class, 'allPatientsWithAppointments']); // Patients with appointments
        Route::get('/count', [AppointmentController::class, 'getCount']);  // Appointment count
        Route::get('/category/{category_name}', [AppointmentController::class, 'patientsForCategory']); // Patients by category
        Route::get('/min-max', [AppointmentController::class, 'fetchEarliestAndLatestAppointmentDates']); // Get date range
    });

    // Report Submission Management
    Route::prefix('submissions')->group(function () {
        Route::post('/', [ReportSubmissionController::class, 'createReportSubmissions']);                // Create report submissions
        Route::post('/month-year', [ReportSubmissionController::class, 'fetchReportSubmissionsByFilter']); // Fetch reports by filter
        Route::get('/min-max', [ReportSubmissionController::class, 'fetchEarliestAndLatestReportSubmissionDates']); // Get date range
        Route::get('/pending', [ReportSubmissionController::class, 'fetchCountOfPendingBarangayReports']); // Pending report count
        Route::get('/barangay-reports', [ReportSubmissionController::class, 'fetchReportSubmissionsForBarangay']); // Barangay reports
    });

    // Report Status Management
    Route::prefix('statuses')->group(function () {
        Route::post('/submit/report', [ReportStatusController::class, 'submitReport']);   // Submit report
        Route::post('/report-status', [ReportStatusController::class, 'filterReportStatuses']); // Filter report statuses
        Route::post('/min-max', [ReportStatusController::class, 'fetchEarliestAndLatestReportStatusesDates']); // Get status date range
    });

    // Disease and Age Categories
    Route::prefix('diseases')->group(function() {
        Route::get('/', [DiseaseController::class, 'index']);       // List all diseases
    });

    Route::prefix('age-categories')->group(function() {
        Route::get('/', [AgeCategoryController::class, 'index']);   // List all age categories
    });

    // Indicators
    Route::prefix('indicator')->group(function() {
        Route::get('/', [IndicatorController::class, 'index']);        // List indicators
        Route::get('/{name}', [IndicatorController::class, 'getIndicatorFromServiceName']); // Indicator by service name
    });

    // Family Planning Methods
    Route::get('/fp-method', [FamilyPlanningMethodsController::class, 'index']); // List family planning methods

    // Services
    Route::prefix('services')->group(function () {
        Route::get('/', [ServiceController::class, 'index']);         // List all services
        Route::get('/{service_name}', [ServiceController::class, 'show']); // Show specific service
    });

    // Dashboard Reports
    Route::post('/wra-reports', [WomenOfReproductiveAgeController::class, 'getWomenOfReproductiveAges']); // WRA reports
    Route::post('/family-planning-reports', [FamilyPlanningReportController::class, 'getFamilyPlanningReports']); // Family planning reports
    Route::post('/service-data-reports/{service_name}', [ServiceDataController::class, 'getServiceDataReports']); // Service data reports
    Route::post('/morbidity-reports', [MorbidityReportController::class, 'getMorbidityReports']); // Morbidity reports

    // Filtered Reports by Month and Barangay
    Route::post('/service-data-reports', [ServiceDataController::class, 'getFilteredServiceDataReports']);
    Route::post('/wra-reports/filtered', [WomenOfReproductiveAgeController::class, 'getFilteredWomenOfReproductiveAges']);
    Route::post('/family-planning-reports/filtered', [FamilyPlanningReportController::class, 'getFilteredFamilyPlanningReports']);
    Route::post('/morbidity-reports/filtered', [MorbidityReportController::class, 'getFilteredMorbidityReports']);
    Route::post('/m1-report', [ReportStatusController::class, 'getFilteredM1Reports']);
});