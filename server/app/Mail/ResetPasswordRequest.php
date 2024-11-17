<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordRequest extends Mailable
{
    use Queueable, SerializesModels;

    public $resetLink;  // Declare the reset link variable

    /**
     * Create a new message instance.
     *
     * @param string $resetLink
     */
    public function __construct(string $resetLink)
    {
        $this->resetLink = $resetLink;  // Pass the reset link to the class
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Password Request',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'password_reset_request',
        );
    }

    public function build(): self
    {
        return $this->from("cabuyao-cho1@cho1.site", "Cabuyao City Health Office 1 - Health Center")
                    ->subject("Cabuyao City Health Office 1 - Appointment Confirmation")
                    ->view("password_reset_request")
                    ->with([
                        'resetLink' => $this->resetLink,
                    ]);
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
