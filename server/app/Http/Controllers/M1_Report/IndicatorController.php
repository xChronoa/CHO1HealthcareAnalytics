<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\Indicator;
use App\Models\M1_Report\Service;

class IndicatorController extends Controller
{
    /**
     * List all patients with their appointment details.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Fetch all appointments with their associated patient and category
        $indicators = Indicator::with('service')->get();

        // Format the data to include patient details and appointment details
        $data = $indicators->map(function ($indicator) {
            return [
                'indicator_id' => $indicator->indicator_id,
                'service_id' => $indicator->service->service_id,
                'service_name' => $indicator->service->service_name,
                'parent_indicator_id' => $indicator->parent_indicator_id,
                'indicator_name' => $indicator->indicator_name
            ];
        });

        return response()->json($data);
    }

    public function getIndicatorFromServiceName($serviceName) {
        $service = Service::where('service_name', urldecode($serviceName))->first();

        if (!$service) {
            return response()->json(['error' => 'service not found'], 404);
        }

        $service_id = $service->service_name;

        // Use the service's ID to query the related records
        $related_entries = Indicator::where('service_id', $service->service_id)->get();

        // Format the data to include patient details and appointment details
        $data = $related_entries->map(function ($indicator) {
            return [
                'indicator_id' => $indicator->indicator_id,
                'service_id' => $indicator->service->service_id,
                'service_name' => $indicator->service->service_name,
                'parent_indicator_id' => $indicator->parent_indicator_id,
                'indicator_name' => $indicator->indicator_name
            ];
        });

        return response()->json($data);
    }
}
