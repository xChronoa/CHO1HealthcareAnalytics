<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_user()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Arrange: Create a barangay
        $barangay = \App\Models\Barangay::factory()->create([
            'barangay_name' => 'Sample Barangay'
        ]);

        // Act: Send a POST request to create a new user
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/users', [
                'username' => 'newuser',
                'password' => 'securepassword',
                'email' => 'newuser@example.com',
                'role' => 'encoder',
                'status' => 'active',
                'barangay_name' => $barangay->barangay_name
            ]);

        // Assert: Check if the response status is 201 and the user is created
        $response->assertStatus(201)
            ->assertJson([
                'username' => 'newuser',
                'email' => 'newuser@example.com',
                'role' => 'encoder',
                'barangay_id' => $barangay->barangay_id,
                'status' => 'active',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'role' => 'encoder',
            'barangay_id' => $barangay->barangay_id,
            'status' => 'active',
        ]);
    }

    public function test_update_user()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Arrange: Create a user and a barangay
        $user = \App\Models\User::factory()->create();
        $barangay = \App\Models\Barangay::factory()->create([
            'barangay_name' => 'Updated Barangay'
        ]);

        // Act: Send a PUT request to update the user
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson('/api/users/' . $user->user_id, [
                'username' => 'updatedusername',
                'email' => 'updatedemail@example.com',
                'barangay_name' => $barangay->barangay_name,
                'status' => 'active'
            ]);

        // Assert: Check if the response is successful and the user is updated
        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'user_id' => $user->user_id,
            'username' => 'updatedusername',
            'email' => 'updatedemail@example.com',
            'barangay_id' => $barangay->barangay_id,
            'status' => 'active'
        ]);
    }

    public function test_disable_user()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Arrange: Create a user with active status
        $user = \App\Models\User::factory()->create(['status' => 'active']);

        // Act: Send a request to disable the user
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/users/disable/{$user->user_id}");

        // Assert: Check if the response is successful and the user status is updated
        $response->assertStatus(200)
            ->assertJson(['message' => 'User status updated to disabled successfully.']);

        // Verify the user's status in the database
        $this->assertDatabaseHas('users', [
            'user_id' => $user->user_id,
            'status' => 'disabled',
        ]);
    }

    public function test_user_endpoint_unauthorized_without_token()
    {
        // Act: Send a GET request to the user endpoint without an authentication token
        $response = $this->getJson('/api/user');

        // Assert: Check if the response status is 401 and contains the 'Unauthenticated' message
        $response->assertStatus(401)
            ->assertJson([
                'message' => "Unauthenticated.",
            ]);
    }

    public function test_show_user_with_all_fields_populated()
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin']);
        $response = $this->post('/api/login', ['email' => $admin->email, 'password' => 'password']);
        $token = $response->json('token');

        // Arrange: Create a user with all fields populated and a related barangay
        $barangay = \App\Models\Barangay::factory()->create();
        $user = \App\Models\User::factory()->create([
            'barangay_id' => $barangay->barangay_id,
            'status' => 'active',
        ]);

        // Act: Send a GET request to fetch the user details
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson("/api/users/{$user->user_id}");

        // Assert: Check if the response status is 200 and contains the correct user data
        $response->assertStatus(200)
            ->assertJson([
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'barangay_name' => $barangay->barangay_name,
                'status' => $user->status,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ]);
    }

    // public function test_auth_check_returns_session_expired_message_when_token_is_expired()
    // {
    //     // Arrange: Create a user and a personal access token for that user
    //     $user = \App\Models\User::factory()->create(['status' => 'active']);
    //     $token = $user->createToken('TestToken', ['*']);
    //     $expiredToken = $token->p;
    //     $expiredToken->expires_at = now()->subDay(); // Set the token to be expired
    //     $expiredToken->save();

    //     // Encrypt the token's plain text ID to simulate the cookie value
    //     $encryptedToken = encrypt($expiredToken->id);

    //     // Act: Send a GET request to the /auth/check endpoint with the expired token
    //     $response = $this->withCookie('cho_session', $encryptedToken)
    //         ->getJson('/api/auth/check');

    //     // Assert: Check if the response status is 401 and contains the 'Your session has expired' message
    //     $response->assertStatus(401)
    //         ->assertJson([
    //             'message' => 'Your session has expired. Please log in again to continue.'
    //         ]);
    // }

    // public function test_auth_check_returns_disabled_message_when_user_status_is_disabled()
    // {
    //     // Arrange: Create a user with 'disabled' status
    //     $user = \App\Models\User::factory()->create(['status' => 'disabled']);
    //     $token = $user->createToken('TestToken')->plainTextToken;

    //     // Simulate the 'cho_session' cookie with the encrypted token
    //     $encryptedToken = encrypt($token);

    //     // Act: Send a GET request to the '/auth/check' endpoint with the cookie
    //     $response = $this->withCookie('cho_session', $encryptedToken)
    //         ->getJson('/api/auth/check');

    //     // Assert: Check if the response status is 403 and contains the correct message
    //     $response->assertStatus(403)
    //         ->assertJson([
    //             'message' => 'Your account has been disabled. Please contact support for assistance.',
    //         ]);
    // }

    // public function test_should_return_user_details_when_token_is_valid_and_user_is_active()
    // {
    //     // Arrange: Create an active user and generate a valid token
    //     $user = \App\Models\User::factory()->create(['status' => 'active']);
    //     $token = $user->createToken('TestToken')->plainTextToken;
    //     $encryptedToken = encrypt($token);

    //     // Act: Send a GET request to the /auth/check endpoint with the valid token
    //     $response = $this->withCookie('cho_session', $encryptedToken)
    //         ->getJson('/api/auth/check');

    //     // Assert: Check if the response status is 200 and contains the correct user data
    //     $response->assertStatus(200)
    //         ->assertJson([
    //             'role' => $user->role,
    //             'barangay_name' => optional($user->barangay)->barangay_name,
    //             'username' => $user->username,
    //             'status' => $user->status,
    //             'email' => $user->email,
    //             'user_id' => $user->user_id,
    //         ]);
    // }

    // public function test_auth_check_returns_something_went_wrong_on_unexpected_exception()
    // {
    //     // Mock the request to simulate the presence of a 'cho_session' cookie//-
    //     $request = \Mockery::mock(Request::class); //+
    //     $request->shouldReceive('cookie')->with('cho_session')->andReturn('mocked_token');

    //     // Mock the decrypt function to throw a generic exception//-
    //     \Illuminate\Support\Facades\Crypt::shouldReceive('decrypt')->andThrow(new \Exception('Unexpected error'));

    //     // Act: Call the route and capture the response//-
    //     $response = $this->getJson('/api/auth/check', ['cho_session' => 'mocked_token']);

    //     // Assert: Check if the response status is 500 and contains the 'Something went wrong' message//-
    //     $response->assertStatus(500)
    //         ->assertJson([
    //             'message' => 'Something went wrong. Please try again later.',
    //         ]);
    // }

    // public function test_auth_check_returns_401_when_user_not_logged_in()
    // {
    //     // Act: Send a GET request to the auth check endpoint without a session cookie
    //     $response = $this->getJson('/api/auth/check');

    //     // Assert: Check if the response status is 401 and contains the 'not_logged' status
    //     $response->assertStatus(401)
    //         ->assertJson([
    //             'message' => 'You are not logged in. Please log in to continue.',
    //             'status' => 'not_logged',
    //         ]);
    // }
}
