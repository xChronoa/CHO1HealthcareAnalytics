import cabuyao_logo from "../assets/cabuyao_logo.png";
import "../styles/appointment.css";

import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Appointment() {
    return (
        <>
            <Header />
            
            <main className="bg-almond min-h-screen flex justify-center items-center flex-col">
                <div className="title flex flex-col justify-center items-center my-5 gap-2">
                    <img className="size-44" src={cabuyao_logo} alt="City of Cabuyao Logo" />
                    <h2 className="text-black font-bold text-2xl uppercase">book appointment</h2>
                </div>

                
                <div id="dividing-line" className="bg-black h-1 w-11/12 rounded"></div>
                
                {/* Appointment Information */}
                <div className="appointment-details w-4/5 flex flex-col justify-center items-center">
                    <h2 className="font-bold self-center md:self-start uppercase text-lg my-5">Personal Information</h2>
                    
                    <form id="appointment" className="flex flex-col justify-center min-w-96 w-3/4 mt-2 mb-16 p-5 px-8 border-black border-2 rounded">
                        {/* Full Name */}
                        <div className="input-group flex flex-row flex-wrap lg:flex-nowrap mb-3 gap-5">
                            <div className="first-name flex items-center gap-2 w-full">
                                <label className="min-w-24" htmlFor="first-name">First Name:</label>
                                <input className="w-full" type="text" name="first-name" id="first-name" placeholder="First Name" required/>
                            </div>

                            <div className="last-name flex items-center gap-2 w-full">
                                <label className="min-w-24" htmlFor="last-name">Last Name:</label>
                                <input className="w-full" type="text" name="last-name" id="last-name" placeholder="Last Name" required/>
                            </div>
                        </div>

                        {/* Sex */}
                        <div className="input-group flex flex-col mb-3 gap-2">
                            <label htmlFor="sex">Sex:</label>
                            
                            <div className="sex-group flex justify-evenly flex-row gap-5">
                                <div className="male flex gap-2">
                                    <input type="radio" name="sex" id="male" value="Male" required/>
                                    <label htmlFor="male">Male</label>
                                </div>

                                <div className="female flex gap-2">
                                    <input type="radio" name="sex" id="female" value="Female" required/>
                                    <label htmlFor="female">Female</label>
                                </div>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="birthdate">Date of Birth:</label>
                            <input className='w-full' type="date" name="birthdate" id="birthdate" required/>
                        </div>

                        {/* Address */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="address">Address:</label>
                            <input type="text" name="address" id="address" placeholder="House No. / Street / Barangay"required/>
                        </div>

                        {/* Appointment Date */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="appointment-date">Appointment Date:</label>
                            <input className='w-full' type="datetime-local" name="appointment-date" id="appointment-date" required/>
                        </div>

                        {/* Type of Appointment */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="appointment-type">Type of Appointment:</label>
                            <select className="p-2" name="appointment-type" id="appointment-type" required>
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
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="email">Email:</label>
                            <input className="" type="email" name="email" id="email" placeholder="example@email.com" required/>
                        </div>

                        {/* Contact Number */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="phone-number">Contact Number:</label>
                            <div className="input w-full relative">
                                <input className="w-full pr-28" type="text" name="phone-number" id="phone-number" placeholder="+1 (123) 456-7890" required/>
                                <button className="absolute right-2 top-1 bg-green text-white p-1 px-3 rounded-full shadow-xl hover:opacity-75 transition-all">Send OTP</button>
                            </div>
                        </div>

                        {/* OTP */}
                        <div className="input-group flex flex-col mb-3">
                            <label htmlFor="otp">OTP</label>
                            <input type="text" name="otp" id="otp" placeholder="123456" required/>
                        </div>

                        {/* Patient Note */}
                        <div className="input-group flex flex-col mb-3">
                            <textarea className="p-2" name="note" id="note" cols={50} rows={10} placeholder="Leave a note"></textarea>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="terms flex flex-row justify-center items-center my-2">
                            <div className="wrap flex flex-row gap-5 w-full md:w-3/4">
                                <input className="scale-150" type="checkbox" name="terms" id="terms" required/>
                                <label htmlFor="terms">
                                    <p className="font-bold text-justify">
                                        I agree with the <span className="text-green">Terms of Use</span> and <span className="text-green"> Privacy Policy</span> and I declare that I have read the Information that is required in accordance with <span className="text-green">RA 1073 (Data Privacy Act of 2012)</span>.
                                    </p>
                                </label>
                            </div>
                        </div>

                        <button className="uppercase bg-green text-white font-bold p-2 my-5 rounded-lg hover:opacity-75 transition-all shadow-xl" type="submit">Submit</button>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    );
}
