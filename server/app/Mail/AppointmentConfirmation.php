<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\Appointment\Patient;
use App\Models\Appointment\Appointment;

class AppointmentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        private readonly Patient $patient,
        private readonly Appointment $appointment,
        private readonly string $appointmentCategoryName
    )
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Confirmation',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'appointment_confirmation',
        );
    }

    public function build(): self
    {
        return $this->from("cabuyao-cho1@cho1.site", "Cabuyao City Health Office 1 - Health Center")
                    ->subject("Cabuyao City Health Office 1 - Appointment Confirmation")
                    ->view("appointment_confirmation")
                    ->with([
                        'patient' => $this->patient,
                        'appointment' => $this->appointment,
                        'appointmentCategoryName' => $this->appointmentCategoryName,
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
