<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Models\M1_Report\ServiceData;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceDataController extends Controller
{
    /**
     * Fetch and return service data report details based on provided filters.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getServiceDataReports(Request $request): JsonResponse
    {
        try {
            // Validate input parameters
            $validator = Validator::make($request->all(), [
                'service_name' => 'nullable|string|max:255', // service_name is nullable, string, max 255 characters
                'barangay_name' => 'nullable|string|max:255', // barangay_name is nullable, string, max 255 characters
                'year' => 'nullable|integer',
            ]);

            // Check if validation fails
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY); // 422 Unprocessable Entity for validation errors
            }

            // If validation passes, retrieve the validated parameters
            $serviceName = $request->input('service_name');
            $barangayName = $request->input('barangay_name');
            $year = $request->input('year');

            // Build the query with eager loading and filtering
            $query = ServiceData::with([
                'indicator', // Load the indicator relationship
                'ageCategory', // Load the ageCategory relationship
                'reportStatus.reportSubmission.barangay', // Load the barangay relationship
                'service' // Load the service relationship
            ]);

            // Apply filtering if service_name is provided
            if ($serviceName) {
                $query->whereHas('service', function ($q) use ($serviceName) {
                    $q->where('service_name', $serviceName);
                });
            }

            // Apply filtering if barangay_name is provided
            if ($barangayName) {
                $query->whereHas('reportStatus.reportSubmission.barangay', function ($q) use ($barangayName) {
                    $q->where('barangay_name', $barangayName);
                });
            }

            // Apply filtering if year is provided
            if ($year) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($year) {
                    $q->where('report_year', $year);
                });
            }

            $serviceData = $query->get();

            // Transform the data for frontend consumption
            $formattedData = $serviceData->map(function ($data) {
                // Ensure related models exist to avoid null errors
                $indicatorName = $data->indicator ? $data->indicator->indicator_name : null;
                $ageCategory = $data->ageCategory ? $data->ageCategory->age_category : null;
                $barangayName = $data->reportStatus && $data->reportStatus->reportSubmission && $data->reportStatus->reportSubmission->barangay
                    ? $data->reportStatus->reportSubmission->barangay->barangay_name
                    : 'Unknown';

                // Generate the report_period using reportTemplate data if available
                $reportPeriod = $data->reportStatus && $data->reportStatus->reportSubmission && $data->reportStatus->reportSubmission->reportTemplate
                    ? Carbon::create(
                        $data->reportStatus->reportSubmission->reportTemplate->report_year,
                        $data->reportStatus->reportSubmission->reportTemplate->report_month,
                        1
                    )->format('Y-m')
                    : 'Unknown';

                // Include service_name if it is null for indicator_name
                $serviceName = $data->service ? $data->service->service_name : 'Unknown';

                return [
                    'service_data_id' => $data->service_data_id,
                    'service_id' => $data->service_id,
                    'indicator_name' => $indicatorName,
                    'age_category' => $ageCategory,
                    'barangay_name' => $barangayName,
                    'report_period' => $reportPeriod,
                    'value_type' => $data->value_type,
                    'value' => $data->value,
                    'remarks' => $data->remarks,
                    'service_name' => $serviceName, // Include service_name in the response
                ];
            })->filter(); // Filter out null values from missing relationships

            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Error fetching service data reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getFilteredServiceDataReports(Request $request): JsonResponse
    {
        try {
            // Validate request inputs
            $validator = Validator::make($request->all(), [
                'service_name' => 'nullable|string|max:255',
                'barangay_id' => 'nullable|sometimes|integer|exists:barangays,barangay_id',
                'report_month' => 'required|integer',
                'report_year' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get the authenticated user and request parameters
            $user = Auth::user();
            $serviceName = $request->service_name;
            $barangayId = $request->barangay_id;
            $reportMonth = $request->report_month;
            $reportYear = $request->report_year;

            // Initialize the query with necessary relationships
            $query = ServiceData::with([
                'indicator', // Eager load the indicator relationship
                'ageCategory', // Eager load the ageCategory relationship
                'reportStatus.reportSubmission.barangay', // Eager load the barangay relationship
                'service' // Eager load the service relationship
            ]);

            // Apply filtering based on the user's role
            if ($user->role === 'admin') {
                // Admin: use the provided barangay_id or return all if not provided
                if ($barangayId) {
                    $query->whereHas('reportStatus.reportSubmission', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                }
            } elseif ($user->role === 'encoder') {
                // Encoder: restrict data to the user's affiliated barangay_id
                $encoderBarangayId = $user->barangay_id;
                if ($encoderBarangayId) {
                    $query->whereHas('reportStatus.reportSubmission', function ($q) use ($encoderBarangayId) {
                        $q->where('barangay_id', $encoderBarangayId);
                    });
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Encoder does not have an affiliated barangay.',
                    ], Response::HTTP_FORBIDDEN);
                }
            }

            // Apply filtering for the report period if both month and year are provided
            if ($reportMonth && $reportYear) {
                $query->whereHas('reportStatus.reportSubmission.reportTemplate', function ($q) use ($reportMonth, $reportYear) {
                    $q->where('report_month', $reportMonth)
                        ->where('report_year', $reportYear);
                });
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Report month and year must be provided.',
                ], Response::HTTP_BAD_REQUEST);
            }

            // Apply service name filtering if provided
            if ($serviceName) {
                $query->whereHas('service', function ($q) use ($serviceName) {
                    $q->where('service_name', $serviceName);
                });
            }

            // Fetch the filtered service data
            $serviceData = $query->get();

            // Transform the data into the desired structure
            $formattedData = [];

            foreach ($serviceData as $data) {
                $serviceKey = $data->service ? $data->service->service_name : 'Unknown';
                $indicator = $data->indicator;
                $indicatorId = $indicator ? $indicator->indicator_id : null;
                $indicatorName = $indicator ? $indicator->indicator_name : 'Unknown';

                // Initialize service if not already set
                if (!isset($formattedData[$serviceKey])) {
                    $formattedData[$serviceKey] = [
                        'indicators' => [],
                    ];
                }

                // Initialize indicator if not already set
                if (!isset($formattedData[$serviceKey]['indicators'][$indicatorId])) {
                    $formattedData[$serviceKey]['indicators'][$indicatorId] = [
                        'indicator_id' => $indicatorId,
                        'indicator_name' => $indicatorName,
                        'age_categories' => [],
                        'total' => 0, // Initialize total
                        'male' => 0,   // Initialize male
                        'female' => 0, // Initialize female
                        'remarks' => $data->remarks ? $data->remarks : '', // Set remarks if available
                    ];
                }

                // Check for age category
                if ($data->ageCategory) {
                    $ageCategoryKey = $data->ageCategory->age_category;

                    // Initialize age category if not already set
                    if (!isset($formattedData[$serviceKey]['indicators'][$indicatorId]['age_categories'][$ageCategoryKey])) {
                        $formattedData[$serviceKey]['indicators'][$indicatorId]['age_categories'][$ageCategoryKey] = [
                            'value' => 0,
                        ];
                    }

                    // Aggregate value for the age category
                    $formattedData[$serviceKey]['indicators'][$indicatorId]['age_categories'][$ageCategoryKey]['value'] += $data->value;

                    // Update total from the accumulated value of age categories
                    $formattedData[$serviceKey]['indicators'][$indicatorId]['total'] += $data->value;
                } else {
                    // Handle case for male and female values (if applicable)
                    if ($data->value_type) {
                        switch ($data->value_type) {
                            case 'male':
                                $formattedData[$serviceKey]['indicators'][$indicatorId]['male'] += $data->value;
                                break;

                            case 'female':
                                $formattedData[$serviceKey]['indicators'][$indicatorId]['female'] += $data->value;
                                break;

                            case 'total':
                                $formattedData[$serviceKey]['indicators'][$indicatorId]['total'] += $data->value; // This will be relevant if you use total elsewhere
                                break;

                            default:
                                // Handle unknown or unexpected value_types if necessary
                                break;
                        }
                    }
                }
            }

            // After processing, handle indicators with null ids
            foreach ($formattedData as &$services) {
                if (isset($services['indicators'])) {
                    // Iterate over indicators to ensure all data is correctly structured
                    foreach ($services['indicators'] as &$indicatorData) {
                        if ($indicatorData['indicator_id'] === null) {
                            // Handle cases where indicator_id is null
                            $indicatorData['indicator_id'] = 'Unknown'; // Or any default value you prefer
                            $indicatorData['indicator_name'] = 'Unknown'; // Set name accordingly
                        }
                    }
                    // Convert to indexed array for easier access
                    $services['indicators'] = array_values($services['indicators']);
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching service data reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching service data reports.'  . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
