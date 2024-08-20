<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    #[\PHPUnit\Framework\Attributes\Test]
    public function user_can_login_with_valid_credentials()
    {
        // Create a user
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        // Attempt to log in
        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        // Assert login is successful
        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['user_id', 'username', 'email'],
                'token'
            ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function login_fails_with_invalid_credentials()
    {
        // Attempt to log in with invalid credentials
        $response = $this->postJson('/login', [
            'email' => 'invalid@example.com',
            'password' => 'wrongpassword',
        ]);

        // Assert login fails
        $response->assertStatus(401)
            ->assertJson(['message' => 'The provided credentials are incorrect.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function user_can_logout()
    {
        // Create and authenticate a user
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Perform logout
        $response = $this->withToken($token)->postJson('/logout');

        // Assert logout is successful
        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully.']);
    }
}
