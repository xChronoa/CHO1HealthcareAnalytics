import cabuyao_logo from "../assets/cabuyao_logo.png";
import "../styles/appointment.css";

export default function Appointment() {
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-2 my-5 title">
                <img
                    className="size-44"
                    src={cabuyao_logo}
                    alt="City of Cabuyao Logo"
                />
                <h2 className="text-2xl font-bold text-black uppercase">
                    book appointment
                </h2>
            </div>

            <div
                id="dividing-line"
                className="w-11/12 h-1 bg-black rounded"
            ></div>

            {/* Appointment Information */}
            <div className="flex flex-col items-center justify-center w-4/5 appointment-details">
                <h2 className="self-center my-5 text-lg font-bold uppercase md:self-start">
                    Personal Information
                </h2>

                <form
                    id="appointment"
                    className="flex flex-col justify-center w-3/4 p-5 px-8 mt-2 mb-16 border-2 border-black rounded min-w-96"
                >
                    {/* Full Name */}
                    <div className="flex flex-row flex-wrap gap-5 mb-3 input-group lg:flex-nowrap">
                        <div className="flex items-center w-full gap-2 first-name">
                            <label className="min-w-24" htmlFor="first-name">
                                First Name:
                            </label>
                            <input
                                className="w-full"
                                type="text"
                                name="first-name"
                                id="first-name"
                                placeholder="First Name"
                                required
                            />
                        </div>

                        <div className="flex items-center w-full gap-2 last-name">
                            <label className="min-w-24" htmlFor="last-name">
                                Last Name:
                            </label>
                            <input
                                className="w-full"
                                type="text"
                                name="last-name"
                                id="last-name"
                                placeholder="Last Name"
                                required
                            />
                        </div>
                    </div>

                    {/* Sex */}
                    <div className="flex flex-col gap-2 mb-3 input-group">
                        <label htmlFor="sex">Sex:</label>

                        <div className="flex flex-row gap-5 sex-group justify-evenly">
                            <div className="flex gap-2 male">
                                <input
                                    type="radio"
                                    name="sex"
                                    id="male"
                                    value="Male"
                                    required
                                />
                                <label htmlFor="male">Male</label>
                            </div>

                            <div className="flex gap-2 female">
                                <input
                                    type="radio"
                                    name="sex"
                                    id="female"
                                    value="Female"
                                    required
                                />
                                <label htmlFor="female">Female</label>
                            </div>
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="birthdate">Date of Birth:</label>
                        <input
                            className="w-full"
                            type="date"
                            name="birthdate"
                            id="birthdate"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="address">Address:</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            placeholder="House No. / Street / Barangay"
                            required
                        />
                    </div>

                    {/* Appointment Date */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="appointment-date">
                            Appointment Date:
                        </label>
                        <input
                            className="w-full"
                            type="datetime-local"
                            name="appointment-date"
                            id="appointment-date"
                            required
                        />
                    </div>

                    {/* Type of Appointment */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="appointment-type">
                            Type of Appointment:
                        </label>
                        <select
                            className="p-2"
                            name="appointment-type"
                            id="appointment-type"
                            required
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                            <option value={9}>9</option>
                            <option value={10}>10</option>
                        </select>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            className=""
                            type="email"
                            name="email"
                            id="email"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    {/* Contact Number */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="phone-number">Contact Number:</label>
                        <div className="relative w-full input">
                            <input
                                className="w-full pr-28"
                                type="text"
                                name="phone-number"
                                id="phone-number"
                                placeholder="+1 (123) 456-7890"
                                required
                            />
                            <button className="absolute p-1 px-3 text-white transition-all rounded-full shadow-xl right-2 top-1 bg-green hover:opacity-75">
                                Send OTP
                            </button>
                        </div>
                    </div>

                    {/* OTP */}
                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="otp">OTP</label>
                        <input
                            type="text"
                            name="otp"
                            id="otp"
                            placeholder="123456"
                            required
                        />
                    </div>

                    {/* Patient Note */}
                    <div className="flex flex-col mb-3 input-group">
                        <textarea
                            className="p-2"
                            name="note"
                            id="note"
                            cols={50}
                            rows={10}
                            placeholder="Leave a note"
                        ></textarea>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex flex-row items-center justify-center my-2 terms">
                        <div className="flex flex-row w-full gap-5 wrap md:w-3/4">
                            <input
                                className="scale-150"
                                type="checkbox"
                                name="terms"
                                id="terms"
                                required
                            />
                            <label htmlFor="terms">
                                <p className="font-bold text-justify">
                                    I agree with the{" "}
                                    <span className="text-green">
                                        Terms of Use
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-green">
                                        {" "}
                                        Privacy Policy
                                    </span>{" "}
                                    and I declare that I have read the
                                    Information that is required in accordance
                                    with{" "}
                                    <span className="text-green">
                                        RA 1073 (Data Privacy Act of 2012)
                                    </span>
                                    .
                                </p>
                            </label>
                        </div>
                    </div>

                    <button
                        className="p-2 my-5 font-bold text-white uppercase transition-all rounded-lg shadow-xl bg-green hover:opacity-75"
                        type="submit"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </>
    );
}
