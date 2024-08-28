<?php

namespace App\Http\Controllers\Appointment;

use App\Http\Controllers\Controller;
use App\Models\Appointment\AppointmentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;

class AppointmentCategoryController extends Controller
{
    /**
     * Display a listing of the appointment categories.
     *
     * @return Response
     */
    public function index(): Response
    {
        // Fetch all appointment categories
        $appointmentCategories = AppointmentCategory::all();

        // Return the data as a JSON response
        return response($appointmentCategories);
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
