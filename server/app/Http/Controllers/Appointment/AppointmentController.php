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
        $appointments = Appointment::with('patient', 'appointmentCategory')->get();

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        // Validate the incoming request data with user-friendly error messages
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'sex' => 'required|in:Male,Female',
            'birthdate' => 'required|date',
            'address' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|email|exists:patients,email',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_category_name' => 'required|string|exists:appointment_categories,appointment_category_name',
            'patient_note' => 'nullable|string',
        ], [
            'first_name.required' => 'Please enter your first name.',
            'last_name.required' => 'Please enter your last name.',
            'sex.required' => 'Please select a valid gender.',
            'birthdate.required' => 'Please enter your birthdate.',
            'address.required' => 'Please enter your address.',
            'email.required' => 'Please enter a valid email address.',
            'email.exists' => 'The provided email does not match our records. Please register first.',
            'appointment_date.required' => 'Please select a date for the appointment.',
            'appointment_date.after_or_equal' => 'The appointment date cannot be in the past.',
            'appointment_category_name.required' => 'Please select an appointment category.',
            'appointment_category_name.exists' => 'The selected appointment category does not exist.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            // Check if a patient with the same email exists, update details if so
            $patient = Patient::where('email', $request->email)->first();

            if ($patient) {
                $patient->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'sex' => $request->sex,
                    'birthdate' => $request->birthdate,
                    'address' => $request->address,
                    'phone_number' => $request->phone_number,
                ]);
            } else {
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

            // Prevent duplicate appointments on the same date
            $existingAppointment = Appointment::where('patient_id', $patient->patient_id)
                ->whereDate('appointment_date', $request->appointment_date)
                ->exists();

            if ($existingAppointment) {
                return response()->json([
                    'error' => 'You already have an appointment scheduled for this date. Please choose a different date.'
                ], 409);
            }

            // Retrieve appointment category and validate allowed days and slots
            $appointmentCategory = AppointmentCategory::where('appointment_category_name', $request->appointment_category_name)->firstOrFail();
            $slotsPerCategory = [
                'Maternal Health Consultation' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], 'slots' => 70],
                'Animal Bite Vaccination' => ['days' => ['Monday', 'Thursday'], 'slots' => 70],
                'General Checkup' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
                'Baby Vaccine' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
                'TB DOTS' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
            ];

            // Parse the appointment date and check the allowed days
            $date = new \DateTime($request->appointment_date);
            $dayOfWeek = $date->format('l');

            if (!in_array($dayOfWeek, $slotsPerCategory[$appointmentCategory->appointment_category_name]['days'] ?? [])) {
                return response()->json([
                    'error' => 'Appointments are not available on ' . $dayOfWeek . ' for the selected category. Please choose an allowed day.'
                ], 400);
            }

            // Check and calculate available slots
            $appointmentsCount = Appointment::where('appointment_category_id', $appointmentCategory->appointment_category_id)
                ->whereDate('appointment_date', $request->appointment_date)
                ->count();
            $totalSlots = $slotsPerCategory[$appointmentCategory->appointment_category_name]['slots'];
            $availableSlots = $totalSlots - $appointmentsCount;

            if ($availableSlots <= 0) {
                return response()->json([
                    'error' => 'No available slots for the selected category on this date. Please choose another date or category.'
                ], 400);
            }

            // Queue number generation
            $maxQueueNumber = Appointment::whereDate('appointment_date', $request->appointment_date)
                ->max('queue_number');
            $queueNumber = $maxQueueNumber ? $maxQueueNumber + 1 : 1;

            // Create appointment
            $appointment = Appointment::create([
                'patient_id' => $patient->patient_id,
                'appointment_date' => $request->appointment_date,
                'appointment_category_id' => $appointmentCategory->appointment_category_id,
                'patient_note' => $request->patient_note,
                'queue_number' => $queueNumber,
            ]);

            // Send confirmation email
            Mail::to($patient->email)->send(new AppointmentConfirmation(
                $patient,
                $appointment,
                $appointmentCategory->appointment_category_name
            ));

            DB::commit();

            return response()->json([
                "success" => "Appointment successfully created, and a confirmation email has been sent.",
                'patient' => $patient,
                'appointment' => $appointment,
                'appointmentCategory' => $appointmentCategory->appointment_category_name
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Log the error for debugging (production ready)
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
     * List patients with their appointment details for a specific category name and date.
     *
     * @param string $categoryName
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function patientsForCategory(string $categoryName, Request $request)
    {
        $date = $request->query('date');

        // If the category is "All" or "all", fetch appointments for all categories on the given date
        if (strtolower($categoryName) === 'all') {
            // Fetch appointments across all categories filtered by date
            $appointmentsQuery = Appointment::with('patient', 'category');

            if ($date) {
                $appointmentsQuery->whereDate('appointment_date', $date);
            }

            $appointments = $appointmentsQuery->get();
        } else {
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

            $appointments = $appointmentsQuery->orderBy("queue_number")->get();
        }

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
                    'id' => $appointment->category->appointment_category_id,
                    'name' => $appointment->category->appointment_category_name,
                ],
                'patient_note' => $appointment->patient_note,
                'queue_number' => $appointment->queue_number,
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
            // Log the error for debugging purposes in production
            Log::error('Error fetching earliest and latest appointment dates: ' . $e->getMessage());

            // Return a generic error response with status 500 (Internal Server Error)
            return response()->json([
                'error' => 'Something went wrong while fetching the appointment dates.',
            ], 500);
        }
    }
}
