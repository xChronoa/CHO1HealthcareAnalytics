<?php

namespace App\Http\Controllers\Appointment;

use App\Http\Controllers\Controller;
use App\Models\Appointment\AppointmentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Appointment\Appointment;
use Symfony\Component\HttpFoundation\Response;

class AppointmentCategoryController extends Controller
{
    /**
     * Display a listing of the appointment categories with available slots based on the selected date.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Retrieve the selected_date from the query parameter in "YYYY-MM-DD" format
        $selectedDate = $request->input('selected_date');

        // Define the slot limits and allowed days for each category
        $slotsPerCategory = [
            'Maternal Health' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], 'slots' => 70],
            'Animal Bite Vaccination' => ['days' => ['Monday', 'Thursday'], 'slots' => 70],
            'General Checkup' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
            'Baby Vaccine' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
            'TB Dots' => ['days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'slots' => 70],
        ];

        // Fetch appointment categories and calculate available slots if a date is provided
        $appointmentCategories = AppointmentCategory::all()->map(function ($category) use ($slotsPerCategory, $selectedDate) {
            $categoryName = $category->appointment_category_name;

            // If selected_date is null, return category info without calculating slots
            if (is_null($selectedDate)) {
                return [
                    'category' => $category,
                    'available_slots' => null,
                ];
            }

            // Parse the selected date and determine the day of the week
            $date = new \DateTime($selectedDate);
            $dayOfWeek = $date->format('l'); // For example, "Monday"

            // Check if appointments are allowed on this day for the category
            if (in_array($dayOfWeek, $slotsPerCategory[$categoryName]['days'] ?? [])) {
                // Total slots defined for the category
                $totalSlots = $slotsPerCategory[$categoryName]['slots'];

                // Count existing appointments on the selected date for the category
                $appointmentsCount = Appointment::where('appointment_category_id', $category->appointment_category_id)
                    ->whereDate('appointment_date', $selectedDate)
                    ->count();

                // Calculate available slots
                $availableSlots = $totalSlots - $appointmentsCount;
            } else {
                // No slots available if the day does not match allowed days for the category
                $availableSlots = 0;
            }

            // Return the category with calculated available slots for the selected date
            return [
                'category' => $category,
                'available_slots' => $availableSlots,
            ];
        });

        // Return data as JSON
        return response()->json($appointmentCategories);
    }

    /**
     * Store a newly created appointment category in storage.
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        // Define validation rules
        $rules = [
            'appointment_category_name' => 'required|string|max:255|unique:appointment_categories,appointment_category_name',
        ];

        // Create validator instance
        $validator = Validator::make($request->all(), $rules);

        // Check if validation fails
        if ($validator->fails()) {
            return response(['errors' => $validator->errors()], 422);
        }

        // Create a new appointment category record
        $appointmentCategory = AppointmentCategory::create($validator->validated());

        // Return the created record as a JSON response
        return response($appointmentCategory, 201);
    }

    /**
     * Display the specified appointment category.
     *
     * @param int $id
     * @return Response
     */
    public function show(int $id): Response
    {
        // Find the appointment category by its ID
        $appointmentCategory = AppointmentCategory::findOrFail($id);

        // Return the found record as a JSON response
        return response($appointmentCategory);
    }

    /**
     * Update the specified appointment category in storage.
     *
     * @param Request $request
     * @param int $id
     * @return Response
     */
    public function update(Request $request, int $id): Response
    {
        // Define validation rules
        $rules = [
            'appointment_category_name' => 'required|string|max:255|unique:appointment_categories,appointment_category_name,' . $id . ',appointment_category_id',
        ];

        // Create validator instance
        $validator = Validator::make($request->all(), $rules);

        // Check if validation fails
        if ($validator->fails()) {
            return response(['errors' => $validator->errors()], 422);
        }

        // Find and update the appointment category record
        $appointmentCategory = AppointmentCategory::findOrFail($id);
        $appointmentCategory->update($validator->validated());

        // Return the updated record as a JSON response
        return response($appointmentCategory);
    }

    /**
     * Remove the specified appointment category from storage.
     *
     * @param int $id
     * @return Response
     */
    public function destroy(int $id): Response
    {
        // Find and delete the appointment category record
        $appointmentCategory = AppointmentCategory::findOrFail($id);
        $appointmentCategory->delete();

        // Return a success message
        return response(['message' => 'Appointment category deleted successfully.']);
    }
}
