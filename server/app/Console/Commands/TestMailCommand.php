<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Illuminate\Support\Facades\Mail;
use App\Mail\AppointmentConfirmation;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-mail';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test email to verify email configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Define the recipient's email and the message
        $recipientEmail = 'dummy.onenine@gmail.com'; // Change this to your email
        $message = "This is a test email sent from the console command.";

        try {
            // Send a raw email
            Mail::raw($message, function ($mail) use ($recipientEmail) {
                $mail->to($recipientEmail)
                     ->subject('Test Email');
            });

            $this->info('Test email sent successfully!');
        } catch (\Exception $e) {
            $this->error('Failed to send test email: ' . $e->getMessage());
        }
    }
}
