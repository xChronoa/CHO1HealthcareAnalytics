<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UserController extends Controller
{
    // Display a listing of the resource.
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // Store a newly created resource in storage.
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => 'required|string',
            'barangayId' => 'required|exists:barangays,barangayId',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Sanitize input
        $data = $validator->validated();
        $data['password'] = bcrypt($data['password']); // Encrypt the password

        try {
            // Create user
            $user = User::create($data);

            return response()->json($user, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong!'], 500);
        }
    }

    // Display the specified resource.
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    // Update the specified resource in storage.
    public function update(Request $request, $id)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $id . ',userId',
            'password' => 'sometimes|required|string|min:8',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id . ',userId',
            'role' => 'sometimes|required|string',
            'barangayId' => 'sometimes|required|exists:barangays,barangayId',
            'status' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Sanitize input
        $data = $validator->validated();
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']); // Encrypt the password if provided
        }

        try {
            $user = User::findOrFail($id);
            $user->update($data);

            return response()->json($user);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong!'], 500);
        }
    }

    // Remove the specified resource from storage.
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong!'], 500);
        }
    }

    /**
     * Log in the user and issue a token.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $rules = [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ];
        
        $validator = Validator::make($request->all(), $rules);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Attempt to authenticate the user
        $credentials = $validator->validated(); // Use validated data directly

        if (Auth::attempt($credentials)) {
            // Retrieve the authenticated user's ID
            $userId = Auth::id(); // Or Auth::user()->user_id if using a custom primary key

            // Retrieve the user using the ID
            $user = User::findOrFail($userId);

            // Create a token for the authenticated user
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email,
                ],
                'token' => $token,
            ], 200);
        }

        return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
    }


    // Log out the user and invalidate the session
    public function logout(Request $request)
    {
        if ($request->user() || !$request->user()->currentAccessToken()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->user()->currentAccessToken()->delete();

        // return response()->json(['message' => 'User successfully logged out.', 200]);
        return response()->json($request->user());
    }

    // Get the authenticated user's details
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
