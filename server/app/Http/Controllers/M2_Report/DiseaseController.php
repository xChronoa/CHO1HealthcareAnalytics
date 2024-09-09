<?php

namespace App\Http\Controllers\M2_Report;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\M2_Report\Disease;

class DiseaseController extends Controller
{
    public function index() {
        $diseases = Disease::select("disease_id", "disease_name", "disease_code")->get();

        return response()->json($diseases);
    }
}
