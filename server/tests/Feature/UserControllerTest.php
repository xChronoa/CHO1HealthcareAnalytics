<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user creation (POST /api/users)
     *
     * @return void
     */
    public function test_create_user()
    {
        // Create a user manually for authentication
        $user = User::create([
            'username' => 'existing_user',
            'email' => 'existing@example.com',
            'password' => bcrypt('password123'), // Ensure you hash the password
        ]);

        // Generate a bearer token for the created user
        $token = $user->createToken('TestToken')->plainTextToken;

        // Data to create a new user
        $data = [
            'username' => 'john_doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        // Simulate a POST request with Bearer token authentication
        $response = $this->postJson('/api/users', $data, [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert the user is created and the correct response is returned
        $response->assertStatus(201)
                 ->assertJson([
                     'username' => 'john_doe',
                     'email' => 'john@example.com',
                 ]);

        // Optionally, check if the user is present in the database
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    /**
     * Test user update (PUT /api/users/{id})
     *
     * @return void
     */
    public function test_update_user()
    {
        // Create a user manually for authentication
        $user = User::create([
            'username' => 'test_user',
            'email' => 'testuser@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Generate a bearer token for the created user
        $token = $user->createToken('TestToken')->plainTextToken;

        // Data to update the user
        $data = [
            'username' => 'updated_user',
            'email' => 'updated@example.com',
        ];

        // Simulate a PUT request to update the user with Bearer token authentication
        $response = $this->putJson("/api/users/{$user->id}", $data, [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert the response status and data
        $response->assertStatus(200)
                 ->assertJson([
                     'username' => 'updated_user',
                     'email' => 'updated@example.com',
                 ]);

        // Assert the database was updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => 'updated_user',
            'email' => 'updated@example.com',
        ]);
    }

    /**
     * Test fetching a user (GET /api/users/{id})
     *
     * @return void
     */
    public function test_show_user()
    {
        // Create a user manually for authentication
        $user = User::create([
            'username' => 'view_user',
            'email' => 'viewuser@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Generate a bearer token for the created user
        $token = $user->createToken('TestToken')->plainTextToken;

        // Simulate a GET request to show the user details with Bearer token authentication
        $response = $this->getJson("/api/users/{$user->id}", [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert the response status and data
        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $user->id,
                     'username' => $user->username,
                     'email' => $user->email,
                 ]);
    }

    /**
     * Test disabling a user (PATCH /api/users/{id}/disable)
     *
     * @return void
     */
    public function test_disable_user()
    {
        // Create a user manually for authentication
        $user = User::create([
            'username' => 'disable_user',
            'email' => 'disableuser@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Generate a bearer token for the created user
        $token = $user->createToken('TestToken')->plainTextToken;

        // Simulate a PATCH request to disable the user with Bearer token authentication
        $response = $this->patchJson("/api/users/disable/{$user->id}", [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert the response status and check that the user's status is now disabled
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'disabled',
                 ]);

        // Assert the database has been updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'disabled',
        ]);
    }
}
