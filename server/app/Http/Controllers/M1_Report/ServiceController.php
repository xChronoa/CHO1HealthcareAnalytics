<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\Service;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ServiceController extends Controller
{
    public function index() {
        $services = Service::select("service_id", "service_name")->get();

        return response()->json($services);
    }

    public function show(Request $request, $service_name) {
        try {
            // Fetch the service by name from the database
            $service = Service::where('service_name', $service_name)->firstOrFail();
    
            // Return the service data as JSON
            return response()->json($service);
        } catch (ModelNotFoundException $e) {
            // Return a 404 error if the service is not found
            return response()->json(['error' => 'Service not found'], 404);
        }
    }
}
