<?php

namespace App\Http\Controllers\Appointment;

use App\Http\Controllers\Controller;
use App\Models\Appointment\AppointmentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AppointmentCategoryController extends Controller
{
    /**
     * Display a listing of the appointment categories with availability status based on the selected date.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // Retrieve the selected_date from the query parameter in "YYYY-MM-DD" format
        $selectedDate = $request->input('selected_date');

        // Define the allowed days for each category
        $allowedDaysPerCategory = [
            'Maternal Health Consultation' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            'Animal Bite Vaccination' => ['Monday', 'Thursday'],
            'General Checkup' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'Baby Vaccine' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'TB DOTS' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        ];

        // Fetch appointment categories and calculate availability status if a date is provided
        $appointmentCategories = AppointmentCategory::all()->map(function ($category) use ($allowedDaysPerCategory, $selectedDate) {
            $categoryName = $category->appointment_category_name;

            // If selected_date is null, return category info with is_available as false
            if (is_null($selectedDate)) {
                return [
                    'category' => $category,
                    'is_available' => false,
                ];
            }

            // Check if category exists in allowedDaysPerCategory
            if (!isset($allowedDaysPerCategory[$categoryName])) {
                error_log("Category '$categoryName' not found in allowedDaysPerCategory.");
                return [
                    'category' => $category,
                    'is_available' => false,
                ];
            }

            // Parse the selected date and determine the day of the week
            $date = new \DateTime($selectedDate);
            $dayOfWeek = $date->format('l'); // e.g., "Monday"

            // Determine if appointments are available on this day for the category
            $isAvailable = in_array($dayOfWeek, $allowedDaysPerCategory[$categoryName]);

            // Return the category with availability status for the selected date
            return [
                'category' => $category,
                'is_available' => $isAvailable,
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
