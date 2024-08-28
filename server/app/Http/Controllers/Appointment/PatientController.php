<?php

namespace App\Http\Controllers\Appointment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Models\Appointment\Patient;

class PatientController extends Controller
{
    /**
     * Display a listing of the patients.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $patients = Patient::all();
        return response()->json($patients);
    }

    /**
     * Store a newly created patient in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:male,female',
            'birthdate' => 'required|date',
            'address' => 'required|string',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|email|unique:patients,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $patient = Patient::create($request->all());

        return response()->json($patient, 201);
    }

    /**
     * Display the specified patient.
     *
     * @param  \App\Models\Appointment\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function show(Patient $patient)
    {
        return response()->json($patient);
    }

    /**
     * Update the specified patient in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Appointment\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Patient $patient)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'sex' => 'nullable|in:male,female',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:patients,email,' . $patient->patient_id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $patient->update($request->all());

        return response()->json($patient);
    }

    /**
     * Remove the specified patient from storage.
     *
     * @param  \App\Models\Appointment\Patient  $patient
     * @return \Illuminate\Http\Response
     */
    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
