<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\ResetPasswordRequest;
use Exception;

class ResetPasswordController extends Controller
{
    /**
     * Find a user by their email.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findUserByEmail(Request $request)
    {
        // Validate the email input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        // Handle validation failure
        if ($validator->fails()) {
            return response()->json(['error' => 'No account found with this email. Please check and try again.'], 404);
        }

        try {
            // Fetch user by email
            $user = User::where('email', $request->email)->first();

            // If user is found, return user data
            return response()->json(['exist' => true], 200);
        } catch (Exception $e) {
            // Handle any unexpected errors
            return response()->json(['error' => 'Something went wrong. Please try again later.'], 500);
        }
    }

    /**
     * Send password reset link to the user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPasswordResetLink(Request $request)
    {
        // Validate the email input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        // Handle validation failure
        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid email address provided.'], 400);
        }

        DB::beginTransaction(); // Start the transaction

        try {
            $user = User::where('email', $request->email)->first();

            // Secure token generation with hash and salt
            $token = hash('sha256', Str::random(60) . $user->email . now());

            // Check if a token already exists for the given email
            $existingToken = DB::table('password_reset_tokens')
                ->where('email', $user->email)
                ->first();

            if ($existingToken) {
                // If a token exists, update the token
                DB::table('password_reset_tokens')
                    ->where('email', $user->email)
                    ->update([
                        'token' => $token,
                        'created_at' => now(),
                    ]);
            } else {
                // Insert a new token if none exists
                DB::table('password_reset_tokens')->insert([
                    'email' => $user->email,
                    'token' => $token,
                    'created_at' => now(),
                ]);
            }

            // Prepare the reset link to be sent to the user
            // Full URL for frontend domain
            $resetLink = env('FRONTEND_URL') . '/forgot-password?token=' . $token; // Updated for external domain

            // Send the password reset email
            Mail::to($user->email)->send(new ResetPasswordRequest($resetLink));

            DB::commit(); // Commit the transaction

            return response()->json(['message' => 'Password reset link sent successfully. Please check your email.'], 200);
        } catch (Exception $e) {
            DB::rollBack(); // Rollback the transaction in case of failure
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle the password reset process.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        // Validate the request inputs
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'password' => 'required|confirmed|min:8', // Password must be confirmed and at least 8 characters
        ]);

        // Handle validation failure
        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid input data. Please check your entries and try again.'], 400);
        }

        DB::beginTransaction(); // Start the transaction

        try {
            // Check if the token exists in the password_reset_tokens table
            $reset = DB::table('password_reset_tokens')
                ->where('token', $request->token)
                ->first();

            if (!$reset) {
                return response()->json(['error' => 'Invalid or expired token.'], 400);
            }

            // Optionally, check if the token has expired (you can implement this if you have expiration time in your table)
            // if ($reset->created_at < now()->subHours(1)) {
            //     return response()->json(['error' => 'Token has expired.'], 400);
            // }

            // Retrieve the user by the email associated with the token
            $user = User::where('email', $reset->email)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            // Update the user's password
            $user->password = bcrypt($request->password);
            $user->save();

            // Delete the reset token after password reset
            DB::table('password_reset_tokens')->where('token', $request->token)->delete();

            DB::commit(); // Commit the transaction

            return response()->json(['role' => $user->role, 'message' => 'Password successfully updated. You can now log in with your new password.'], 200);
        } catch (Exception $e) {
            DB::rollBack(); // Rollback the transaction in case of failure
            return response()->json(['error' => 'Failed to reset password. Please try again later.'], 500);
        }
    }

    /**
     * Check if the token is valid (exists and not expired).
     *
     */
    public function isTokenValid(Request $request)
    {
        $token = $request->token;
        
        // Check if the token exists in the password_reset_tokens table
        $resetToken = DB::table('password_reset_tokens')->where('token', $token)->first();

        if (!$resetToken) {
            return response()->json(["isValid" => false, 'message' => "Token does not exist."], 404); // Token doesn't exist
        }

        // Optionally, check if the token has expired (for example, after 1 hour)
        // If you want the token to expire after a certain period, uncomment and adjust this check
        if ($resetToken->created_at < now()->subHours(1)) {
            return response()->json(["isValid" => false, 'message' => "Token has expired."], 410); // Token has expired
        }

        return response()->json(["isValid" => true]); // Token exists and is still valid
    }
}
