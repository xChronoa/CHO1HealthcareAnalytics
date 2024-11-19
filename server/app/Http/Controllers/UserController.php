<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

use App\Models\User;
use App\Models\Barangay;

class UserController extends Controller
{
    // Display a listing of the resource.
    public function index()
    {
        // Eager load the barangay relationship
        $users = User::with('barangay')->get();

        // Transform the user data to include barangay_name
        $formattedUsers = $users->map(function ($user) {
            return [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'barangay_name' => $user->barangay ? $user->barangay->barangay_name : null,
                'status' => ucfirst($user->status),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return response()->json($formattedUsers);
    }

    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string',
            'barangay_name' => 'required|string|exists:barangays,barangay_name',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Sanitize input
        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']); // Encrypt the password

        try {
            // Convert barangay name to barangay_id
            $barangay = Barangay::where('barangay_name', $data['barangay_name'])->first();

            // Check if the barangay exists
            if (!$barangay) {
                return response()->json(['error' => 'Barangay not found!'], 404);
            }
            $data['barangay_id'] = $barangay->barangay_id; // Assign barangay_id to data array

            // Remove barangay name from data array
            unset($data['barangay_name']);

            // Default status to 'active' if not provided
            if (!isset($data['status'])) {
                $data['status'] = ucfirst('active');
            }

            // Create user
            $user = User::create($data);

            return response()->json($user, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Display the specified resource.
    public function show($id)
    {
        try {
            // Fetch the user with related barangay data
            $user = User::with('barangay')->findOrFail($id);

            // Prepare the response with the `barangay_name` from the related model
            $response = [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'barangay_name' => $user->barangay ? $user->barangay->barangay_name : null,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            return response()->json($response, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    // Update the specified resource in storage.
    public function update(Request $request, $id)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $id . ',user_id',
            'password' => 'sometimes|required|string|min:8|confirmed', // Use Laravel's built-in `confirmed` rule
            'password_confirmation' => 'sometimes|required_with:password', // Ensure confirmPassword exists if password is provided
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id . ',user_id',
            'barangay_name' => 'sometimes|nullable|string|exists:barangays,barangay_name',
            'status' => 'sometimes|required|string|in:active,disabled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Sanitize input
        $data = $validator->validated();

        // Hash the password if it is present in the data
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
            unset($data['password_confirmation']); // Remove confirmPassword after validation
        }

        try {
            // Convert barangay name to barangay_id if provided
            if (isset($data['barangay_name'])) {
                $barangay = Barangay::where('barangay_name', $data['barangay_name'])->first();

                // Check if the barangay exists
                if (!$barangay) {
                    return response()->json(['error' => 'Barangay not found!'], 404);
                }

                $data['barangay_id'] = $barangay->barangay_id; // Assign barangay_id to data array
                unset($data['barangay_name']); // Remove barangay name from data array
            }

            // Default status to 'active' if not provided
            if (!isset($data['status'])) {
                $data['status'] = 'active';
            }

            // Update the user in a transaction
            $user = User::findOrFail($id);
            $user->update($data);

            // Invalidate tokens if status is changed to disabled
            if (isset($data['status']) && $data['status'] === 'disabled') {
                $user->tokens()->delete();
            }

            return response()->json($data, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong!'], 500);
        }
    }

    public function disable($id)
    {
        try {
            // Find the user by ID or throw a ModelNotFoundException if not found
            $user = User::findOrFail($id);

            // Check if the user is already disabled
            if ($user->status === 'disabled') {
                return response()->json([
                    'message' => 'User is already disabled.'
                ], 200); // Return a 200 OK response
            }

            // Update the user's status to 'disabled'
            $user->status = 'disabled';  // 'ucfirst' is not needed because 'disabled' is already in lowercase.

            // Invalidate all tokens for the user
            $user->tokens()->delete();

            // Save the user status update
            $user->save();

            return response()->json([
                'message' => 'User status updated to disabled successfully.'
            ], 200); // Success response with status code 200
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log the exception and return a 404 error response
            Log::error("User not found. ID: $id", ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            // Log the exception details for debugging
            Log::error('Error disabling user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return a 500 error response
            return response()->json([
                'error' => 'Something went wrong. Please try again later.'
            ], 500);
        }
    }


    public function login(Request $request)
    {
        $rules = [
            'username' => 'required_without:email|string', // Allow username if email is not provided
            'email' => 'required_without:username|string|email', // Allow email if username is not provided
            'password' => 'required|string',
            'previousPath' => 'nullable|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get the credentials
        $credentials = $validator->validated();
        $previousPath = $credentials['previousPath'] ?? '/';

        // Remove previousPath from credentials
        unset($credentials['previousPath']);

        // Find the user by email or username
        $user = null;
        if (isset($credentials['email'])) {
            $user = User::where('email', $credentials['email'])->first();
        } elseif (isset($credentials['username'])) {
            $user = User::where('username', $credentials['username'])->first();
        }

        // If no user is found, return an error
        if (!$user) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
        }

        // Attempt to authenticate the user using email or username
        $attempt = Auth::attempt(
            isset($credentials['email'])
                ? ['email' => $credentials['email'], 'password' => $credentials['password']]
                : ['username' => $credentials['username'], 'password' => $credentials['password']]
        );

        if ($attempt) {
            // Check if the user is active
            if ($user->status === "disabled") {
                return response()->json([
                    "error" => [
                        'code' => 'ACCOUNT_DISABLED',
                        'message' => "The account has been disabled. Please contact the administrator to resolve this issue.",
                    ],
                ], 403);
            }

            // Define the path based on role
            $validPaths = [
                'admin' => ['/admin/login', '/'],
                'encoder' => ['/barangay/login'],
            ];

            // Check if previousPath matches the user's role
            if (array_key_exists($user->role, $validPaths) && !in_array($previousPath, $validPaths[$user->role])) {
                return response()->json([
                    'error' => [
                        'code' => "UNAUTHORIZED_ROLE",
                        'message' => 'Unauthorized access to the previous path.',
                        'role' => $user->role,
                        'path' => $previousPath
                    ],
                ], 403);
            }

            // Create a token for the authenticated user
            $token = $user->createToken('cho_session', [], now()->addHours(6))->plainTextToken;

            $cookie = cookie('cho_session', encrypt($token), 60 * 5, '/', 'localhost', false, true, true, 'lax');

            // Build the user response array
            $userResponse = [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ];

            // Include barangay information if it exists
            if ($user->barangay) {
                $userResponse['barangay_id'] = $user->barangay->barangay_id;
                $userResponse['barangay_name'] = $user->barangay->barangay_name;
            }

            return response()->json([
                'message' => 'Login successful',
                'user' => $userResponse,
            ], 200)->cookie($cookie);
        }

        return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
    }

    // Log out the user and invalidate the session
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->currentAccessToken()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->currentAccessToken()->delete();

        $cookie = cookie('cho_session', '', -1, '/', 'localhost', false, true, true, 'lax');

        return response()->json(['message' => 'User successfully logged out.'], 200)->cookie($cookie);
    }

    // Get the authenticated user's details
    public function user(Request $request)
    {
        // Ensure user is authenticated
        if (! Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the authenticated user
        $user = Auth::user();

        // Return user details with appropriate status code
        return response()->json([
            'user' => [
                'user_id' => $user->user_id, // Use model's primary key 
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'barangay' => $user->barangay,
            ],
        ], 200);
    }
}
