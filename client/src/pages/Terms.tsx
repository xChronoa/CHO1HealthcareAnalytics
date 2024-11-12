const Terms: React.FC = () => {
    return (
        <div className="container px-4 py-12 mx-auto">
            <h1 className="mb-4 text-3xl font-bold text-center">
                Terms of Use for the Appointment System
            </h1>
            
            <div className="w-full h-[2px] border-black border-[1px] my-2"></div>

            <h4 className="mb-6 text-xl">Last Updated: 11/10/2024</h4>

            <section>
                <p>
                    Welcome to the Cabuyao City Health Office 1 Appointment
                    Scheduling System. These Terms of Use govern your access to
                    and use of our online appointment system. By scheduling an
                    appointment through this platform, you acknowledge and agree
                    to comply with these Terms.{" "}
                </p>
                <p className="mt-2">
                    Please read them thoroughly before using the system. If you
                    do not agree with any of these terms, we kindly ask that you
                    refrain from using the appointment scheduling service.
                </p>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    1. Appointment Scheduling
                </h2>
                <ul className="pl-6 mt-2">
                    <li className="pl-10 -indent-7">
                        <strong>1.1 Eligibility</strong> - To use the
                        Appointment System, you must be at least 18 years old or
                        have the consent of a parent or guardian.
                    </li>
                    <li className="pl-10 -indent-7">
                        <strong>1.2 Availability</strong> - The availability of
                        appointment slots may vary based on our team’s schedule,
                        and appointments are subject to confirmation. We reserve
                        the right to modify or cancel appointments at any time
                        due to scheduling conflicts or other unforeseen
                        circumstances.
                    </li>
                    <li className="pl-10 -indent-7">
                        <strong>1.3 Appointment Confirmation</strong> - After
                        submitting your appointment request, you will receive a
                        confirmation email or message detailing the appointment
                        time, location, and any additional instructions. Please
                        ensure the accuracy of your contact information when
                        booking your appointment.
                    </li>
                </ul>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    2. Use of Appointment System
                </h2>
                <ul className="pl-6 mt-2">
                    <li className="pl-10 -indent-7">
                        <strong>2.1 Accurate Information</strong> - When using
                        the Appointment System, you agree to provide accurate,
                        current, and complete information. You are responsible
                        for ensuring that your contact details (email address,
                        phone number, etc.) are up to date to receive
                        appointment confirmations, reminders, and other
                        notifications.
                    </li>
                </ul>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    3. Privacy and Data Collection
                </h2>
                <ul className="pl-6 mt-2">
                    <li className="pl-10 -indent-7">
                        <strong>3.1 Personal Information</strong> - By using the
                        Appointment System, you agree to our collection and use
                        of personal information in accordance with our Privacy
                        Policy. We may collect and store your personal
                        information, including but not limited to your name,
                        email address, phone number, and appointment details, in
                        order to process and manage your appointment.
                    </li>
                    <li className="pl-10 -indent-7">
                        <strong>3.2 Data Security</strong> - We take reasonable
                        measures to protect your personal data. However, no
                        system is completely secure, and we cannot guarantee the
                        absolute security of your data during transmission or
                        storage.
                    </li>
                </ul>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    4. Limitation of Liability
                </h2>
                <ul className="pl-6 mt-2">
                    <li className="pl-10 -indent-7">
                        <strong>
                            4.1 No Guarantee of Service Availability
                        </strong>{" "}
                        - We do not guarantee uninterrupted or error-free access
                        to the system. The Website and Appointment System may be
                        temporarily unavailable due to scheduled maintenance,
                        unforeseen technical issues, or other circumstances
                        beyond our control.
                    </li>
                    <li className="pl-10 -indent-7">
                        <strong>
                            4.2 No Liability for Missed Appointments
                        </strong>{" "}
                        - We are not liable for any missed appointments, loss of
                        time, or inconvenience caused by your failure to arrive
                        on time or for cancellations made outside of the allowed
                        timeframe. We also do not accept liability for issues
                        arising from incorrect or incomplete information
                        provided by you during the booking process.
                    </li>
                </ul>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    5. Changes to These Terms
                </h2>
                <p>
                    We reserve the right to modify these Terms at any time. Any
                    changes will be posted on this page, and the "Last Updated"
                    date will be revised. By continuing to use the Appointment
                    System after such changes, you agree to be bound by the
                    updated Terms.
                </p>
            </section>

            <section className="mt-6">
                <h2 className="text-2xl font-semibold">
                    6. Contact Information
                </h2>
                <p>
                    If you have any questions about these Terms or need
                    assistance with the Appointment System, please contact us
                    at:
                </p>
                <address className="mt-8">
                    <p>
                        <strong>Cabuyao City Health Office 1</strong>
                    </p>
                    <p>Cho-I, F.B. Bailon St, Cabuyao, 4025 Laguna</p>
                    <p>Phone: +63 987 654 3211</p>
                    <p>
                        Email:{" "}
                        <a
                            href="mailto:cabuyao-cho1@cho1.site"
                            className="text-blue-600"
                        >
                            cabuyao-cho1@cho1.site
                        </a>
                    </p>
                </address>
            </section>
        </div>
    );
};

export default Terms;
