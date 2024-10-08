<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Models\M1_Report\Indicator;
use App\Models\M1_Report\ServiceData;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ServiceDataController extends Controller
{
    public function getServiceDataReports(Request $request): JsonResponse
    {
        try {
            // Get the service_name from the request query parameters
            $serviceName = $request->query('service_name');

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
            // Get the authenticated user and request parameters
            $user = Auth::user();
            $serviceName = $request->query('service_name');
            $barangayId = $request->query('barangay_id');
            $reportMonth = $request->query('report_month');
            $reportYear = $request->query('report_year');

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

            // Transform the data for frontend consumption
            $formattedData = $serviceData->map(function ($data) {
                // Ensure relationships exist to avoid null errors
                $indicatorName = $data->indicator ? $data->indicator->indicator_name : null;
                $ageCategory = $data->ageCategory ? $data->ageCategory->age_category : null;
                $barangayName = $data->reportStatus && $data->reportStatus->reportSubmission && $data->reportStatus->reportSubmission->barangay
                    ? $data->reportStatus->reportSubmission->barangay->barangay_name
                    : 'Unknown';

                // Generate the report period using reportTemplate data if available
                $reportPeriod = $data->reportStatus && $data->reportStatus->reportSubmission && $data->reportStatus->reportSubmission->reportTemplate
                    ? Carbon::create(
                        $data->reportStatus->reportSubmission->reportTemplate->report_year,
                        $data->reportStatus->reportSubmission->reportTemplate->report_month,
                        1
                    )->format('Y-m')
                    : 'Unknown';

                // Include the service name if available
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
                    'service_name' => $serviceName, // Include service name in the response
                ];
            })->filter(); // Filter out null values from missing relationships

            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error fetching service data reports: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching service data reports.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
