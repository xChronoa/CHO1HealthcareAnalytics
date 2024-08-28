<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Barangay;

class BarangayController extends Controller
{
    /**
     * Display a listing of the barangays.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $barangays = Barangay::all();
        return response()->json($barangays);
    }

    /**
     * Store a newly created barangay in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'barangay_name' => 'required|string|max:255',
        ]);

        $barangay = Barangay::create([
            'barangay_name' => $request->barangay_name,
        ]);

        return response()->json($barangay, 201);
    }

    /**
     * Display the specified barangay.
     *
     * @param  \App\Models\Barangay  $barangay
     * @return \Illuminate\Http\Response
     */
    public function show(Barangay $barangay)
    {
        return response()->json($barangay);
    }

    /**
     * Update the specified barangay in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Barangay  $barangay
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Barangay $barangay)
    {
        $request->validate([
            'barangay_name' => 'required|string|max:255',
        ]);

        $barangay->update([
            'barangay_name' => $request->barangay_name,
        ]);

        return response()->json($barangay);
    }

    /**
     * Remove the specified barangay from storage.
     *
     * @param  \App\Models\Barangay  $barangay
     * @return \Illuminate\Http\Response
     */
    public function destroy(Barangay $barangay)
    {
        $barangay->delete();
        return response()->json(null, 204);
    }
}
