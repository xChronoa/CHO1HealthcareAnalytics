const Privacy: React.FC = () => {
    return (
        <div className="container px-4 py-12 mx-auto">
            <h1 className="mb-4 text-3xl font-bold text-center">
                Privacy Policy
            </h1>

            <div className="w-full h-[2px] border-black border-[1px] my-2"></div>

            <h4 className="mb-6 text-xl">Last Updated: 11/10/2024</h4>

            <section>
                <p>
                    We are committed to protecting your privacy and ensuring the
                    confidentiality of your personal data. This Privacy Policy
                    explains how we collect, use, store, and protect your
                    personal information when you use our Appointment System and
                    visit our website.
                </p>
                <p className="mt-2">
                    This Privacy Policy complies with the{" "}
                    <span className="italic font-bold underline text-green hover:text-[#009900] transition-all">
                        <a
                            target="_blank"
                            href="https://privacy.gov.ph/data-privacy-act/"
                            rel="noopener noreferrer"
                        >
                            Data Privacy Act of 2012 (Republic Act No. 10173)
                        </a>
                    </span>{" "}
                    of the Philippines and other relevant privacy regulations.
                    By using our Appointment System or interacting with our
                    Website, you agree to the collection and use of your
                    personal information as described in this policy.
                </p>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    Information We Collect
                </h2>
                <p>
                    We collect personal data from you when you use our
                    Appointment System or interact with our Website. The types
                    of personal data we may collect include:
                </p>
                <ul className="pl-6 list-disc">
                    <li>
                        <strong>Personal Identification Information:</strong>{" "}
                        Name, email address, phone number, and other details you
                        provide when scheduling an appointment.
                    </li>
                    <li>
                        <strong>Appointment Details:</strong> Date, time, and
                        purpose of the appointment, as well as any specific
                        requests or notes you provide.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    How We Use Your Information
                </h2>
                <p>
                    We use the personal information we collect for the following
                    purposes:
                </p>
                <ul className="pl-6 list-disc">
                    <li>
                        <strong>Appointment Scheduling:</strong> To process your
                        appointment requests and confirm your appointment.
                    </li>
                    <li>
                        <strong>Communication:</strong> To communicate with you
                        about your appointment details, answer your queries, and
                        notify you of any changes to our services or policies.
                    </li>
                    <li>
                        <strong>Improvement of Services:</strong> To analyze and
                        improve the functionality of our Appointment System,
                        enhance user experience, and troubleshoot any technical
                        issues.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">Data Retention</h2>
                <p>
                    We retain your personal data only for as long as necessary
                    to fulfill the purposes for which it was collected, or as
                    required by law. Once your data is no longer needed, we will
                    securely delete or anonymize it in accordance with the Data
                    Privacy Act.
                </p>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    How We Protect Your Information
                </h2>
                <p>
                    We are committed to securing your personal data and have
                    implemented reasonable physical, technical, and
                    organizational measures to protect it from unauthorized
                    access, alteration, disclosure, or destruction. However,
                    please note that no method of data transmission over the
                    internet or electronic storage is completely secure. While
                    we strive to protect your personal data, we cannot guarantee
                    absolute security.
                </p>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    Sharing Your Information
                </h2>
                <p>
                    We will not sell, rent, or lease your personal information
                    to third parties. However, we may share your personal data
                    with trusted third-party service providers who assist us in
                    providing services, such as web hosting providers, etc.
                    These third parties are bound by confidentiality agreements
                    and are prohibited from using your personal information for
                    purposes other than providing services to us.
                </p>
                <p>
                    We may also disclose your personal information if required
                    by law, regulation, or legal process, or to protect our
                    rights, property, or safety, or the rights, property, and
                    safety of others.
                </p>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    Your Rights as a Data Subject
                </h2>
                <p>
                    Under the Data Privacy Act of 2012, you have the following
                    rights regarding your personal data:
                </p>
                <ul className="pl-6 list-disc">
                    <li>
                        <strong>Right to Access:</strong> You may request access
                        to the personal data we hold about you. We will provide
                        you with a copy of your personal data upon request,
                        subject to certain exceptions provided by law.
                    </li>
                    <li>
                        <strong>Right to Correction:</strong> You may request
                        the correction of any inaccurate or incomplete personal
                        data we hold about you.
                    </li>
                    <li>
                        <strong>Right to Erasure:</strong> You may request the
                        deletion or blocking of your personal data if it is no
                        longer necessary for the purposes for which it was
                        collected, or if you withdraw your consent.
                    </li>
                    <li>
                        <strong>Right to Object:</strong> You may object to the
                        processing of your personal data, particularly if you
                        believe that the processing is unlawful or unjustified.
                    </li>
                    <li>
                        <strong>Right to Data Portability:</strong> You have the
                        right to request that your personal data be transferred
                        to another service provider in a structured, commonly
                        used, and machine-readable format.
                    </li>
                    <li>
                        <strong>Right to Withdraw Consent:</strong> If you have
                        provided consent for us to use your data for marketing
                        purposes, you may withdraw your consent at any time.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">
                    Changes to This Privacy Policy
                </h2>
                <p>
                    We may update this Privacy Policy from time to time to
                    reflect changes in our practices or legal requirements. Any
                    changes will be posted on this page with an updated "Last
                    Updated" date. We encourage you to review this Privacy
                    Policy periodically.
                </p>
            </section>

            <section>
                <h2 className="mt-4 text-2xl font-semibold">Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy or our
                    data privacy practices, or if you wish to exercise your
                    rights as a data subject, please contact us at:
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
                            className="transition-all text-green hover:underline"
                        >
                            cabuyao-cho1@cho1.site
                        </a>
                    </p>
                </address>
            </section>
        </div>
    );
};

export default Privacy;
