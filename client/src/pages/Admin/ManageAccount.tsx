import { faFileInvoice, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const ManageAccount: React.FC = () => {
    return (
        <div className="flex flex-col w-11/12 min-h-screen py-16">
            <header className="mb-4">
                <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                <div className="w-full h-[2px] bg-black"></div>
            </header>

            <div className="flex items-center justify-center flex-1 w-full">
                <section className="flex flex-col items-center w-10/12 gap-16 sm:flex-row">
                    <div className="rounded-lg border border-1 border-black sm:w-1/2 bg-white shadow-lg h-1/2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                        <Link
                            to="create-account"
                            className="flex flex-col items-center justify-center gap-5 p-10"
                            aria-label="Create a new account"
                        >
                            <FontAwesomeIcon
                                id="create-account"
                                icon={faUserPlus}
                                className="size-44"
                            />
                            <label
                                htmlFor={"create-account"}
                                className="text-lg font-semibold"
                            >
                                Create Account
                            </label>
                        </Link>
                    </div>
                    <div className="rounded-lg border border-1 border-black sm:w-1/2 bg-white shadow-lg h-1/2 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all">
                        <Link
                            to="accounts"
                            className="flex flex-col items-center justify-center gap-5 p-10"
                            aria-label="View invoices"
                        >
                            <FontAwesomeIcon
                                id="account-list"
                                icon={faFileInvoice}
                                className="size-44"
                            />
                            <label
                                htmlFor={"account-list"}
                                className="text-lg font-semibold"
                            >
                                List of Accounts
                            </label>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManageAccount;