<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
    <h1 style="color: #333; text-align: center;">Appointment Confirmation</h1>
    
    <p>Dear {{ $patient->first_name }} {{ $patient->last_name }},</p>
    
    <p>We are pleased to inform you that your appointment has been successfully scheduled. Below are your appointment details:</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Queue Number:</strong> {{ $appointment->queue_number }}</p>
        <p><strong>Date of Appointment:</strong> {{ date('F j, Y', strtotime($appointment->appointment_date)) }}</p>
        <p><strong>Appointment Category:</strong> {{ $appointmentCategoryName }}</p>
        @if($appointment->patient_note)
            <p><strong>Your Note:</strong> {{ $appointment->patient_note }}</p>
        @endif
    </div>

    <p><strong>Patient Information:</strong></p>
    <ul style="list-style: none; padding-left: 0;">
        <li><strong>Name:</strong> {{ $patient->first_name }} {{ $patient->last_name }}</li>
        <li><strong>Email:</strong> {{ $patient->email }}</li>
        <li><strong>Phone:</strong> {{ $patient->phone_number ?: 'Not provided' }}</li>
        <li><strong>Address:</strong> {{ $patient->address }}</li>
    </ul>

    <p><strong>Important Notes:</strong></p>
    <ul>
        <li>Remember to bring any relevant medical records or documentation.</li>
        <li>If you need to reschedule, kindly contact us at least 24 hours in advance.</li>
    </ul>

    <p>If you have any questions or concerns, please do not hesitate to reach out to us.</p>
    
    <p style="text-align: right;">Best regards,<br><strong>Cabuyao City Health Office 1 - Health Center</strong></p>
</div>
