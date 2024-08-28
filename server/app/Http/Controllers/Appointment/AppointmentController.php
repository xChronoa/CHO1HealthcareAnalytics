<?php

namespace App\Http\Controllers\Appointment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Appointment\Appointment;
use App\Models\Appointment\AppointmentCategory;
use Illuminate\Support\Facades\DB;
use App\Models\Appointment\Patient;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the appointments.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $appointments = Appointment::with('patient', 'appointmentCategory')->get();

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birthdate' => 'required|date',
            'address' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|email|unique:patients,email',
            'appointment_date' => 'required|date',
            'appointment_category_name' => 'required|string|exists:appointment_categories,appointment_category_name',
            'patient_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // return response()->json($request->all(), 200);

        // Start a transaction
        DB::beginTransaction();

        try {
            // Create the patient
            $patient = Patient::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'sex' => $request->sex,
                'birthdate' => $request->birthdate,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
                'email' => $request->email,
            ]);

            // Retrieve the appointment_category_id using the appointment_category_name
            $appointmentCategory = AppointmentCategory::where('appointment_category_name', $request->appointment_category_name)->firstOrFail();
            $appointmentCategoryId = $appointmentCategory->appointment_category_id;

            // Create the appointment
            $appointment = Appointment::create([
                'patient_id' => $patient->patient_id,
                'appointment_date' => $request->appointment_date,
                'appointment_category_id' => $appointmentCategoryId,
                'patient_note' => $request->patient_note,
            ]);

            // Commit the transaction
            DB::commit();

            // Return a response
            return response()->json([
                'message' => 'Patient and Appointment created successfully',
                'appointment' => $appointment
            ]);
        } catch (\Exception $e) {
            // Rollback the transaction if anything goes wrong
            DB::rollBack();

            // Return an error response
            return response()->json([
                'message' => 'An error occurred while creating the patient and appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified appointment.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show(int $id)
    {
        $appointment = Appointment::with('patient', 'appointmentCategory')->findOrFail($id);

        if (!$appointment) {
            return response()->json(['error' => 'Appointment not found'], 404);
        }

        return response()->json($appointment);
    }

    /**
     * Update the specified appointment in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,patient_id',
            'appointment_date' => 'sometimes|required|date',
            'appointment_category_id' => 'sometimes|required|exists:appointment_categories,appointment_category_id',
            'patient_note' => 'nullable|string',
            'queue_number' => 'nullable|integer',
        ]);

        $appointment = Appointment::findOrFail($id);
        $appointment->update($validated);

        return response()->json($appointment);
    }

    /**
     * Remove the specified appointment from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json(null, 204);
    }

    /**
     * List all patients with their appointment details.
     *
     * @return \Illuminate\Http\Response
     */
    public function allPatientsWithAppointments()
    {
        // Fetch all appointments with their associated patient and category
        $appointments = Appointment::with('patient', 'category')->get();

        // Format the data to include patient details and appointment details
        $data = $appointments->map(function ($appointment) {
            return [
                'patient' => [
                    'id' => $appointment->patient->patient_id,
                    'first_name' => $appointment->patient->first_name,
                    'last_name' => $appointment->patient->last_name,
                    'sex' => $appointment->patient->sex,
                    'birthdate' => $appointment->patient->birthdate,
                    'address' => $appointment->patient->address,
                    'email' => $appointment->patient->email,
                    'phone_number' => $appointment->patient->phone_number,
                ],
                'appointment_date' => $appointment->appointment_date,
                'appointment_category' => [
                    'id' => $appointment->category->appointment_category_id,
                    'name' => $appointment->category->appointment_category_name,
                ],
            ];
        });

        return response()->json($data);
    }

    /**
     * List patients with their appointment details for a specific category name and date.
     *
     * @param string $categoryName
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function patientsForCategory(string $categoryName, Request $request)
    {
        $date = $request->query('date');

        // Fetch the category ID for the given category name
        $category = AppointmentCategory::where('appointment_category_name', $categoryName)->first();

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $categoryId = $category->appointment_category_id;

        // Fetch appointments for the given category ID and date
        $appointmentsQuery = Appointment::where('appointment_category_id', $categoryId)
            ->with('patient', 'category');  // Eager load relationships

        // Filter by date if provided
        if ($date) {
            $appointmentsQuery->whereDate('appointment_date', $date);
        }

        $appointments = $appointmentsQuery->get();

        // Format the data to include patient details and appointment details
        $data = $appointments->map(function ($appointment) {
            return [
                'patient' => [
                    'id' => $appointment->patient->patient_id,
                    'name' => $appointment->patient->name,
                    'sex' => $appointment->patient->sex,
                    'birthdate' => $appointment->patient->birthdate,
                    'address' => $appointment->patient->address,
                    'email' => $appointment->patient->email,
                    'phone_number' => $appointment->patient->phone_number,
                ],
                'appointment_date' => $appointment->appointment_date,
                'appointment_category' => [
                    'id' => $appointment->category->appointment_category_id,
                    'name' => $appointment->category->appointment_category_name,
                ],
            ];
        });

        return response()->json($data);
    }
}
