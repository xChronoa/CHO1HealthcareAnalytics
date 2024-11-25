<?php

namespace App\Http\Controllers\Appointment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Appointment\Appointment;
use App\Models\Appointment\AppointmentCategory;
use Illuminate\Support\Facades\DB;
use App\Models\Appointment\Patient;
use Illuminate\Support\Facades\Validator;

use App\Mail\AppointmentConfirmation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the appointments.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $appointments = Appointment::with('patient', 'category')->get();

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:male,female',
            'birthdate' => 'required|date',
            'address' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|email',
            'appointment_date' => 'required|date',
            'appointment_category_name' => 'required|string|exists:appointment_categories,appointment_category_name',
            'patient_note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Start a transaction
        DB::beginTransaction();

        try {
            // Check if a patient with the same email exists, if so, update details, otherwise create
            $patient = Patient::where('email', $request->email)->first();

            if ($patient) {
                // Update the existing patient details
                $patient->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'sex' => $request->sex,
                    'birthdate' => $request->birthdate,
                    'address' => $request->address,
                    'phone_number' => $request->phone_number,
                ]);
            } else {
                // Create a new patient if none exists with the same email
                $patient = Patient::create([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'sex' => $request->sex,
                    'birthdate' => $request->birthdate,
                    'address' => $request->address,
                    'phone_number' => $request->phone_number,
                ]);
            }

            // Check if the patient already has an appointment on the same date
            $existingAppointment = Appointment::where('patient_id', $patient->patient_id)
                ->whereDate('appointment_date', $request->appointment_date)
                ->exists();

            if ($existingAppointment) {
                return response()->json(['error' => 'You already have an appointment on this date.'], 409);
            }

            // Retrieve the appointment_category_id using the appointment_category_name
            $appointmentCategory = AppointmentCategory::where('appointment_category_name', $request->appointment_category_name)->firstOrFail();
            $appointmentCategoryId = $appointmentCategory->appointment_category_id;

            // Define the allowed days for each category
            $allowedDaysPerCategory = [
                'Maternal Health Consultation' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                'Animal Bite Vaccination' => ['Monday', 'Thursday'],
                'General Checkup' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'Baby Vaccine' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                'TB DOTS' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            ];

            // Parse the selected date and determine the day of the week
            $date = new \DateTime($request->appointment_date);
            $dayOfWeek = $date->format('l'); // For example, "Monday"

            // Check if the appointment category allows appointments on this day
            if (!in_array($dayOfWeek, $allowedDaysPerCategory[$appointmentCategory->appointment_category_name] ?? [])) {
                return response()->json(['error' => 'Appointments are not available on this day for the selected category.'], 400);
            }

            // Check for the highest queue_number for the given appointment_date
            $maxQueueNumber = Appointment::whereDate('appointment_date', $request->appointment_date)
                ->max('queue_number');

            // If no appointments exist for the date, start at 1, otherwise increment
            $queueNumber = $maxQueueNumber ? $maxQueueNumber + 1 : 1;

            // Create the appointment with the generated queue number
            $appointment = Appointment::create([
                'patient_id' => $patient->patient_id,
                'appointment_date' => $request->appointment_date,
                'appointment_category_id' => $appointmentCategoryId,
                'patient_note' => $request->patient_note,
                'queue_number' => $queueNumber,
                'status' => "pending",
            ]);

            // Send confirmation email
            try {
                Mail::to($patient->email)
                    ->send(new AppointmentConfirmation(
                        $patient,
                        $appointment,
                        $appointmentCategory->appointment_category_name
                    ));

                // Commit the transaction
                DB::commit();

                return response()->json([
                    "success" => "Appointment successfully created, and a confirmation email has been sent.",
                    'patient' => $patient,
                    "appointment" => $appointment,
                    "appointmentCategory" => $appointmentCategory->appointment_category_name
                ]);
            } catch (\Exception $e) {
                DB::rollBack(); // Rollback if email fails
                return response()->json(["Error" => $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            // Rollback the transaction if anything goes wrong
            DB::rollBack();

            // Log the error for debugging
            Log::error("Error creating appointment: " . $e->getMessage());

            return response()->json([
                'error' => 'An unexpected error occurred while creating the appointment. Please try again or contact support.'
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
        $appointment = Appointment::with('patient', 'category')->findOrFail($id);

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
            'status' => 'sometimes|required|in:pending,complete,no-show',
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

    public function getCount()
    {
        $appointmentCount = Appointment::all()->count();
        return response()->json(data: [$appointmentCount], status: 200);
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
                    'patient_id' => $appointment->patient->patient_id,
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
                    'appointment_category_id' => $appointment->category->appointment_category_id,
                    'appointment_category_name' => $appointment->category->appointment_category_name,
                ],
            ];
        });

        return response()->json($data);
    }

    /**
     * List patients with their appointment details for a specific category name, date, and status.
     *
     * @param string $categoryName
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function patientsForCategory(string $categoryName, Request $request)
    {
        // Get query parameters
        $date = $request->query('date');
        $status = strtolower($request->query('status'));

        // If the category is "All" or "all", fetch appointments for all categories filtered by date and status
        if (strtolower($categoryName) === 'all') {
            // Fetch appointments across all categories, filtered by date and status
            $appointmentsQuery = Appointment::with('patient', 'category');

            // Filter by date if provided
            if ($date) {
                $appointmentsQuery->whereDate('appointment_date', $date);
            }

            // If status is not 'all', filter by status
            if ($status && $status !== 'all') {
                $appointmentsQuery->where('status', $status);  // Filter by status if provided
            }

            // Fetch all appointments with the applied filters
            $appointments = $appointmentsQuery->get();
        } else {
            // Fetch the category ID for the given category name
            $category = AppointmentCategory::where('appointment_category_name', $categoryName)->first();

            if (!$category) {
                return response()->json(['error' => 'Category not found'], 404);
            }

            $categoryId = $category->appointment_category_id;

            // Fetch appointments for the given category ID, date, and status
            $appointmentsQuery = Appointment::where('appointment_category_id', $categoryId)
                ->with('patient', 'category');  // Eager load relationships

            // Filter by date if provided
            if ($date) {
                $appointmentsQuery->whereDate('appointment_date', $date);
            }

            // If status is not 'all', filter by status
            if ($status && $status !== 'all') {
                $appointmentsQuery->where('status', $status);
            }

            $appointments = $appointmentsQuery->orderBy("queue_number")->get();
        }

        // Format the data to include patient details and appointment details
        $data = $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->appointment_id,
                'patient' => [
                    'patient_id' => $appointment->patient->patient_id,
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
                'patient_note' => $appointment->patient_note,
                'queue_number' => $appointment->queue_number,
                'status' => $appointment->status,
            ];
        });

        return response()->json($data);
    }

    /**
     * Retrieve the earliest and latest appointment dates from the database.
     *
     * This method queries the appointment records to find the minimum and maximum
     * appointment dates, providing a summary of appointment scheduling timelines.
     *
     * @return \Illuminate\Http\Response
     */
    public function fetchEarliestAndLatestAppointmentDates()
    {
        try {
            // Fetch the earliest and latest appointment dates in one query to improve performance
            $dates = Appointment::selectRaw('min(appointment_date) as earliest_appointment_date, max(appointment_date) as latest_appointment_date')->first();

            // Prepare the response data
            $responseData = [];

            // Check if the earliest and latest dates are present and add them to the response
            if (!is_null($dates->earliest_appointment_date)) {
                $responseData['earliest_appointment_date'] = $dates->earliest_appointment_date;
            }

            if (!is_null($dates->latest_appointment_date)) {
                $responseData['latest_appointment_date'] = $dates->latest_appointment_date;
            }

            // If no dates were found, return an empty object
            if (empty($responseData)) {
                return response()->json([], 200); // No data but valid response
            }

            // Return the response with appointment dates
            return response()->json($responseData, 200);
        } catch (\Exception $e) {
            // Log the error for debugging purposes
            Log::error('Error fetching earliest and latest appointment dates: ' . $e->getMessage());

            // Return a generic error response with status 500 (Internal Server Error)
            return response()->json([
                'error' => 'Something went wrong while fetching the appointment dates.',
            ], 500);
        }
    }
}