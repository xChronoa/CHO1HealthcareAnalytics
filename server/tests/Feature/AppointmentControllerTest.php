<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Mail;
use App\Models\Appointment\AppointmentCategory;
use App\Mail\AppointmentConfirmation;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    // Read/Retrieve appointments
    public function test_fetch_all_appointments()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',  // Assuming 'admin' is a valid role
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response (assuming it's returned in the response body)
        $token = $response->json('token');  // Or however the token is returned in your response

        // Arrange: Create necessary data for appointments
        $category = \Database\Factories\AppointmentCategoryFactory::new()->create();
        $patient = \Database\Factories\PatientFactory::new()->create();

        // Create appointments with the required relations
        $appointments = \Database\Factories\AppointmentFactory::new()->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id
        ]);

        // Act: Make a GET request to fetch all appointments with the authorization token
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,  // Pass the token for authentication
        ])->getJson('/api/appointments');

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJsonCount(1) // Assert that there is 1 appointment
            ->assertJsonStructure([
                '*' => [
                    'appointment_id',
                    'patient_id',
                    'appointment_category_id',
                    'appointment_date',
                    'status',
                    'queue_number',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    // Create appointments
    public function test_creating_appointment_with_valid_data()
    {
        // Create the required data for testing
        $appointmentCategory = AppointmentCategory::create([
            'appointment_category_name' => 'General Checkup',
        ]);

        // Mock the mail sending functionality
        Mail::fake();

        $response = $this->postJson('/api/appointments', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'sex' => 'male',
            'birthdate' => '1990-01-01',
            'address' => '123 Main St',
            'phone_number' => '1234567890',
            'email' => 'johndoe@example.com',
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_category_name' => $appointmentCategory->appointment_category_name,
            'patient_note' => 'Please bring test results.',
        ]);

        // Assert a successful response
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'patient' => [
                'patient_id',
                'first_name',
                'last_name',
                'email',
            ],
            'appointment' => [
                'appointment_id',
                'appointment_date',
                'appointment_category_id',
                'patient_note',
                'queue_number',
                'status',
            ],
            'appointmentCategory',
        ]);

        // Assert the database state
        $this->assertDatabaseHas('patients', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'johndoe@example.com',
        ]);

        $this->assertDatabaseHas('appointments', [
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'status' => 'pending',
        ]);

        // Assert that an email was sent
        Mail::assertQueued(AppointmentConfirmation::class, function ($mail) {
            return $mail->hasTo('johndoe@example.com');
        });
    }

    // Update appointment - by status
    public function test_update_appointment_with_valid_data()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Create a patient and an appointment category
        $patient = \Database\Factories\PatientFactory::new()->create();
        $appointmentCategory = \Database\Factories\AppointmentCategoryFactory::new()->create();

        // Create an appointment
        $appointment = \Database\Factories\AppointmentFactory::new()->create([
            'patient_id' => $patient->patient_id,
            'appointment_category_id' => $appointmentCategory->appointment_category_id,
        ]);

        // Act: Update the appointment
        $updateData = [
            'patient_id' => $patient->patient_id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_category_id' => $appointmentCategory->appointment_category_id,
            'patient_note' => 'Updated note',
            'queue_number' => 2,
            'status' => 'complete',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/appointments/{$appointment->appointment_id}", $updateData);

        // Assert: Check response status and updated data
        $response->assertStatus(200)
            ->assertJson([
                'appointment_id' => $appointment->appointment_id,
                'patient_id' => $updateData['patient_id'],
                'appointment_date' => $updateData['appointment_date'],
                'appointment_category_id' => $updateData['appointment_category_id'],
                'patient_note' => $updateData['patient_note'],
                'queue_number' => $updateData['queue_number'],
                'status' => $updateData['status'],
            ]);

        // Assert the database state
        $this->assertDatabaseHas('appointments', [
            'appointment_id' => $appointment->appointment_id,
            'patient_id' => $updateData['patient_id'],
            'appointment_date' => $updateData['appointment_date'],
            'appointment_category_id' => $updateData['appointment_category_id'],
            'patient_note' => $updateData['patient_note'],
            'queue_number' => $updateData['queue_number'],
            'status' => $updateData['status'],
        ]);
    }

    public function test_update_appointment_with_invalid_status()
    {
        // Arrange: Create an admin user and log in to obtain the Sanctum token
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $loginResponse = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Arrange: Create a patient and an appointment
        $patient = \Database\Factories\PatientFactory::new()->create();
        $appointmentCategory = \Database\Factories\AppointmentCategoryFactory::new()->create();

        $appointment = \Database\Factories\AppointmentFactory::new()->create([
            'patient_id' => $patient->patient_id,
            'appointment_category_id' => $appointmentCategory->appointment_category_id,
            'status' => 'pending',
        ]);

        // Act: Attempt to update the appointment with an invalid status
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/appointments/{$appointment->appointment_id}", [
            'status' => 'invalid_status', // Invalid status
        ]);

        // Assert: Check for validation error
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_update_non_existent_appointment_should_return_404()
    {
        // Arrange: Create an admin user and log in to obtain the Sanctum token
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $loginResponse = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $loginResponse->json('token');

        // Act: Attempt to update a non-existent appointment
        $nonExistentAppointmentId = 9999; // Assuming this ID does not exist
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/appointments/{$nonExistentAppointmentId}", [
            'status' => 'complete',
        ]);

        // Assert: Check for 404 error
        $response->assertStatus(404);
    }

    public function test_should_return_empty_list_when_no_appointments_for_specific_category()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');

        // Create an appointment category that does not have any appointments
        \Database\Factories\AppointmentCategoryFactory::new()->create([
            'appointment_category_name' => 'General Checkup'
        ]);

        // Act: Make a GET request to fetch appointments for the "NonExistentCategory" with no appointments
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/category/General Checkup?date=2023-12-31&status=all');

        // Assert: Check response status and ensure the list is empty
        $response->assertStatus(200)
            ->assertJsonCount(0); // Assert that there are no appointments
    }

    public function test_patients_for_non_existent_category_returns_404()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');

        // Act: Attempt to fetch patients for a non-existent category
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/category/NonExistentCategory');

        // Assert: Check that the response status is 404
        $response->assertStatus(404)
            ->assertJson([
                'error' => 'Category not found',
            ]);
    }

    public function test_should_return_appointments_filtered_by_date()
    {
        // Arrange: Create an admin user and log in to obtain a Sanctum token
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
        $token = $response->json('token');

        // Arrange: Create a category and a patient
        $category = \Database\Factories\AppointmentCategoryFactory::new()->create();
        $patient = \Database\Factories\PatientFactory::new()->create();

        // Arrange: Create appointments with different dates
        $appointment1 = \Database\Factories\AppointmentFactory::new()->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id,
            'appointment_date' => '2023-10-01',
        ]);

        $appointment2 = \Database\Factories\AppointmentFactory::new()->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id,
            'appointment_date' => '2023-10-02',
        ]);

        // Act: Make a GET request to fetch appointments filtered by a specific date
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/appointments/category/{$category->appointment_category_name}?date=2023-10-01&status=all");

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJsonCount(1) // Assert that there is 1 appointment for the given date
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'patient' => [
                        'patient_id',
                        'first_name',
                        'last_name',
                        'sex',
                        'birthdate',
                        'address',
                        'email',
                        'phone_number',
                    ],
                    'appointment_date',
                    'appointment_category' => [
                        'id',
                        'name',
                    ],
                    'patient_note',
                    'queue_number',
                    'status',
                ],
            ]);
    }

    public function test_should_return_appointments_filtered_by_status_when_valid_status_is_provided()
    {
        // Arrange: Create an admin user and log in to obtain the Sanctum token
        $admin = \App\Models\User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $token = $response->json('token');

        // Create necessary data for appointments
        $category = \Database\Factories\AppointmentCategoryFactory::new()->create([
            'appointment_category_name' => 'General Checkup',
        ]);

        $patient = \Database\Factories\PatientFactory::new()->create();

        // Create appointments with different statuses
        $appointment1 = \Database\Factories\AppointmentFactory::new()->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id,
            'status' => 'pending',
        ]);

        $appointment2 = \Database\Factories\AppointmentFactory::new()->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id,
            'status' => 'complete',
        ]);

        // Act: Make a GET request to fetch appointments filtered by status
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/category/General Checkup?status=pending');

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'patient' => [
                        'patient_id',
                        'first_name',
                        'last_name',
                        'sex',
                        'birthdate',
                        'address',
                        'email',
                        'phone_number',
                    ],
                    'appointment_date',
                    'appointment_category' => [
                        'id',
                        'name',
                    ],
                    'patient_note',
                    'queue_number',
                    'status',
                ],
            ])
            ->assertJsonFragment(['status' => 'pending']);
    }

    public function test_should_return_all_appointments_when_category_is_all_and_no_filters_are_applied()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'existing_user',
            'email' => 'existing@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');

        // Arrange: Create necessary data for appointments
        $category = \Database\Factories\AppointmentCategoryFactory::new()->create();
        $patient = \Database\Factories\PatientFactory::new()->create();

        // Create multiple appointments
        \Database\Factories\AppointmentFactory::new()->count(3)->create([
            'appointment_category_id' => $category->appointment_category_id,
            'patient_id' => $patient->patient_id
        ]);

        // Act: Make a GET request to fetch all appointments with the authorization token
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/category/all');

        // Assert: Check response status and data structure
        $response->assertStatus(200)
            ->assertJsonCount(3) // Assert that there are 3 appointments
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'patient' => [
                        'patient_id',
                        'first_name',
                        'last_name',
                        'sex',
                        'birthdate',
                        'address',
                        'email',
                        'phone_number',
                    ],
                    'appointment_date',
                    'appointment_category' => [
                        'id',
                        'name',
                    ],
                    'patient_note',
                    'queue_number',
                    'status',
                ],
            ]);
    }

    public function test_should_return_200_with_empty_array_when_no_patients_with_appointments()
    {
        // Arrange: Ensure the database is empty
        \App\Models\Appointment\Appointment::truncate();

        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');

        // Act: Make a GET request to fetch all patients with appointments
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/category/All');

        // Assert: Check response status and data
        $response->assertStatus(200)
            ->assertJson([]);
    }

    public function test_fetch_earliest_and_latest_appointment_dates_response_structure()
    {
        // Arrange: Create some appointments with different dates
        $patient = \Database\Factories\PatientFactory::new()->create();
        $category = \Database\Factories\AppointmentCategoryFactory::new()->create();

        \Database\Factories\AppointmentFactory::new()->create([
            'patient_id' => $patient->patient_id,
            'appointment_category_id' => $category->appointment_category_id,
            'appointment_date' => '2023-01-01',
        ]);

        \Database\Factories\AppointmentFactory::new()->create([
            'patient_id' => $patient->patient_id,
            'appointment_category_id' => $category->appointment_category_id,
            'appointment_date' => '2023-12-31',
        ]);

        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');

        // Act: Make a GET request to fetch appointments for a specific category with no appointments
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/min-max');

        // Assert: Check response status and structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'earliest_appointment_date',
                'latest_appointment_date',
            ]);
    }

    public function test_get_count_returns_zero_when_no_appointments_exist()
    {
        // Arrange: Create an admin user
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        
        // Log in to obtain the Sanctum token for the admin
        $response = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        // Extract the token from the response
        $token = $response->json('token');
        
        // Act: Make a GET request to the getCount endpoint
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/count');
    
        // Assert: Check that the response status is 200 and the count is zero
        $response->assertStatus(200)
                 ->assertJson([0]);
    }

    public function test_get_count_returns_correct_count_with_multiple_appointments()
    {
        // Arrange: Create an admin user and log in to obtain the Sanctum token
        $admin = \App\Models\User::factory()->create([
            'username' => 'admin_user',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    
        $loginResponse = $this->post('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);
    
        $token = $loginResponse->json('token');
    
        // Arrange: Create multiple appointments
        $patient = \Database\Factories\PatientFactory::new()->create();
        $appointmentCategory = \Database\Factories\AppointmentCategoryFactory::new()->create();
    
        \Database\Factories\AppointmentFactory::new()->count(3)->create([
            'patient_id' => $patient->patient_id,
            'appointment_category_id' => $appointmentCategory->appointment_category_id,
        ]);
    
        // Act: Make a GET request to the getCount endpoint
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/appointments/count');
    
        // Assert: Check response status and count
        $response->assertStatus(200)
            ->assertJson([3]); // Assert that the count of appointments is 3
    }
}