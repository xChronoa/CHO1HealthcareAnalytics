<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Throwable $exception)
    {
        // Check for database connection error
        if ($exception instanceof \Illuminate\Database\QueryException) {
            return response()->json([
                'message' => 'There was a problem connecting to the database. Please try again later.'
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
