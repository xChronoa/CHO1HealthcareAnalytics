import { faBullseye, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import landing_page from "../assets/images/landing_page.png"
import cabuyao_logo from "../assets/images/cabuyao_logo.png"
import cho_logo from "../assets/images/cho_logo.png"
import breast_cancer from "../assets/images/breast_cancer.png"
import diabetes_awareness from "../assets/images/diabetes_awareness.png"
import lifestyle_program from "../assets/images/lifestyle_program.png"
import barrio_bakuna from "../assets/images/barrio_bakuna.png"
import buntis_congress from "../assets/images/buntis_congress.png"
import barrio_bakuna_2 from "../assets/images/barrio_bakuna_2.png"

const Overview: React.FC = () => {
    return (
        <>
            <section
                id="appointment"
                className="flex flex-col items-center gap-4 p-4 lg:gap-10 lg:p-8 lg:px-20 md:flex-row"
            >
                <div className="flex flex-col self-center flex-1 gap-4 px-6 text-base lg:px-0 md:justify-between left md:text-lg">
                    <h1 className="text-lg font-bold text-center md:text-left md:text-2xl">
                        Get Quick <br className="hidden md:block" />
                        <span className="text-green">
                            {" "}
                            Medical Services{" "}
                        </span>{" "}
                        <br className="hidden md:block" />
                        from Cabuyao City Health Office 1
                    </h1>
                    <p className="text-justify">
                        Your health, your schedule. Book check-ups, follow-ups,
                        and any necessary appointments at your convenience. It's
                        never been easier to stay on top of your well-being!
                    </p>
                    <Link
                        to={"/appointment"}
                        className="lg:mt-8 lg:text-xl transition-all text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-fit shadow-md shadow-gray-500"
                    >
                        Make an Appointment
                    </Link>
                </div>

                <div className="flex-1 right">
                    <img
                        src={landing_page}
                        alt=""
                        className="min-w-full rounded-lg shadow-lg shadow-gray-500"
                    />
                </div>
            </section>
            <section
                id="about-us"
                className="w-full px-12 py-4 bg-green "
            >
                <div className="flex flex-row items-center w-full gap-4 mb-12 title">
                    <div className="w-9/12 h-[2px] border-white border-[1px]" />
                    <h1 className="text-xl font-bold text-white uppercase text-nowrap">
                        About Us
                    </h1>
                    <div className="w-9/12 h-[2px] border-white border-[1px]" />
                </div>
                <div className="flex flex-col gap-16 text-justify md:gap-8 md:flex-row">
                    <article className="relative flex flex-col flex-1 gap-8 p-4 bg-gray-200 rounded-lg cgc">
                        <img
                            src={cabuyao_logo}
                            alt=""
                            className="absolute inset-0 mx-auto -inset-y-10 size-24 aspect-square"
                        />
                        <h1 className="text-lg font-bold text-center lg:text-2xl mt-14">
                            City Government of Cabuyao
                        </h1>
                        <article className="mission">
                            <h2 className="mb-4 font-bold">
                                <FontAwesomeIcon
                                    icon={faBullseye}
                                    className="mr-2 text-2xl justify-self-start"
                                />
                                Mission
                            </h2>
                            <p>
                                Upliftment of the quality of lives of Cabuyeños
                                through the sustainable delivery of efficient
                                and effective economic, educational, ecological,
                                physical and all basic social and cultural
                                services in an industrial and entrepreneurial
                                community setting
                            </p>
                        </article>
                        <article className="vision">
                            <h2 className="mb-4 font-bold">
                                {" "}
                                <FontAwesomeIcon
                                    icon={faEye}
                                    className="mr-2 text-2xl justify-self-start"
                                />
                                Vision
                            </h2>
                            <p className="indent-8">
                                An entrepreneurial, industrialized, progressive,
                                service-driven and environment-friendly Cabuyao
                                with God-loving citizens.
                            </p>
                            <br />
                            <p className="indent-8">
                                Entrepreneurial Local Government Geologically
                                Stable Community Industry/Small and Medium
                                Enterprises Modern Solid and Hospital Wastes
                                Facilities Linkages with Industry, NGO’s and
                                PO’s
                            </p>
                        </article>
                    </article>

                    <article className="relative flex flex-col flex-1 gap-8 p-4 bg-gray-200 rounded-lg cho1">
                        <img
                            src={cho_logo}
                            alt=""
                            className="absolute inset-0 mx-auto -inset-y-10 size-24 aspect-square"
                        />

                        <h1 className="text-lg font-bold text-center lg:text-2xl mt-14">
                            City Health Office 1
                        </h1>
                        <article className="mission">
                            <h2 className="mb-4 font-bold">
                                <FontAwesomeIcon
                                    icon={faBullseye}
                                    className="mr-2 text-2xl justify-self-start"
                                />
                                Mission
                            </h2>
                            <p className="indent-8">
                                To provide quality health care services to the
                                people of Cabuyao through the combined effort of
                                all sectors of the community, creating a healthy
                                individual with a healthy lifestyle in a healthy
                                environment.
                            </p>
                            <br />
                            <p className="indent-8">
                                “Makapaghatid ng de-kalidad na serbisyong
                                Pangkalusugan sa mga mamamayan ng Cabuyao, sa
                                pamamagitan ng sama-samang pagsisikap ng lahat
                                ng mga sektor ng komunidad, makalikha ng malusog
                                na mamamayan na may malusog na paraan ng
                                pamumuhay sa isang malusog na kapaligiran.”
                            </p>
                        </article>
                        <article className="vision">
                            <h2 className="mb-4 font-bold">
                                {" "}
                                <FontAwesomeIcon
                                    icon={faEye}
                                    className="mr-2 text-2xl justify-self-start"
                                />
                                Vision
                            </h2>
                            <p className="text-center">
                                Health for All, All for Health. <br />
                                “Kalusugan para sa Lahat, <br />
                                Lahat para sa Kalusugan.”
                            </p>
                        </article>
                    </article>
                </div>
            </section>

            <section
                id="programs-events"
                className="flex flex-col items-center justify-center w-full py-4 bg-gray-200 sm:py-12"
            >
                <div className="flex flex-row items-center w-full gap-4 px-8 sm:px-12 title">
                    <h1 className="text-xl font-bold text-black uppercase text-nowrap">
                        Programs & Events
                    </h1>
                    <div className="w-full h-[2px] border-black border-[1px]" />
                </div>
                <div className="grid items-center justify-center w-full grid-cols-1 gap-8 px-8 pt-2 pb-4 sm:px-12 sm:grid-cols-2 place-items-center justify-items-center wrap">
                    <img
                        src={breast_cancer}
                        alt="Breast Cancer"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                    <img
                        src={diabetes_awareness}
                        alt="Diabetes Awareness"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                    <img
                        src={lifestyle_program}
                        alt="Lifestyle Program"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                    <img
                        src={barrio_bakuna}
                        alt="Barrio Bakuna - Butong"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                    <img
                        src={buntis_congress}
                        alt="Buntis Congress"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                    <img
                        src={barrio_bakuna_2}
                        alt="Barrio Bakuna"
                        className="rounded-lg shadow-md shadow-gray-500"
                    />
                </div>
            </section>
        </>
    );
};

export default Overview;
