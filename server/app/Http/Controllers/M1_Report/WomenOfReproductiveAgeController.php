<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\WomenOfReproductiveAge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class WomenOfReproductiveAgeController extends Controller
{
    public function getWomenOfReproductiveAges(Request $request): JsonResponse
    {
        try {
            // Fetch the data from the women_of_reproductive_ages table
            $data = WomenOfReproductiveAge::with([
                'ageCategory', // Load the ageCategory relationship
                'reportStatus', // Load the reportStatus relationship
            ])->get();

            // Transform the data for frontend consumption
            $formattedData = $data->map(function ($item) {
                return [
                    'wra_id' => $item->wra_id,
                    'age_category' => $item->ageCategory ? $item->ageCategory->age_category : null,
                    'unmet_need_modern_fp' => $item->unmet_need_modern_fp,
                    'barangay_name' => $item->reportStatus->reportSubmission->barangay->barangay_name,
                    'report_period' => Carbon::create(
                                $item->reportStatus->reportSubmission->reportTemplate->report_year,
                                $item->reportStatus->reportSubmission->reportTemplate->report_month,
                                1
                    )->format('Y-m'),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $formattedData,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error('Error fetching women of reproductive ages data: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
