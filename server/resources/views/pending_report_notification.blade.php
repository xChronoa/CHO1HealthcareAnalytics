<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pending Report Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        p {
            color: #555;
            margin-bottom: 15px;
        }
        strong {
            color: #000;
        }
        .report-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Pending Reports Notification</h1>
        
        <p>This is a reminder that the following barangay reports have not yet been submitted:</p>

        @foreach ($reports as $report)
            <div class="report-details">
                <p>
                    <strong>Barangay:</strong> {{ $report['barangay_name'] }}<br>
                    <strong>Report Period:</strong> {{ $report['report_period'] }}<br>
                    <strong>Due on:</strong> {{ $report['due_date'] }}
                </p>
            </div>
        @endforeach

        <p>Please prioritize the submission of these reports to avoid any delays in our operations. Thank you for your cooperation.</p>

        <p>Failure to submit reports on time may result in penalties. Ensure all submissions are completed by their due dates to avoid repercussions.</p>

        <div class="footer">
            &copy; {{ date('Y') }} Cabuyao City Health Office 1. All rights reserved.
        </div>
    </div>
</body>
</html>
