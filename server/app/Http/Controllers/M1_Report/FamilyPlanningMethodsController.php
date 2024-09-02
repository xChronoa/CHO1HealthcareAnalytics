<?php

namespace App\Http\Controllers\M1_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M1_Report\FamilyPlanningMethods;

class FamilyPlanningMethodsController extends Controller
{
    /**
     * List all patients with their appointment details.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $methods = FamilyPlanningMethods::all();

        return response()->json($methods);
    }
}
