const NotFound: React.FC = () => {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen gap-5">
            <h1 className="text-[2rem] font-bold">Page Not Found</h1>
            <h2 className="text-[1.5rem]">The page you are trying to access does not exist.</h2>
        </main>
    );
}

export default NotFound;