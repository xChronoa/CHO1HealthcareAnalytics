<?php

namespace App\Http\Controllers;

use App\Models\AgeCategory;
use Illuminate\Http\Request;

class AgeCategoryController extends Controller
{
    public function index() {
        $ageCategories = AgeCategory::select("age_category_id", "age_category")->get();

        return response()->json($ageCategories);
    }
}
