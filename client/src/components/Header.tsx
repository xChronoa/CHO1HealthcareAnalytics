type Prop = {
    logoPath?: string | null;
}

export default function Header( { logoPath }: Prop) {
    return (
        <header className="box-border flex justify-center py-1 shadow-lg bg-green">
            {logoPath ? <img className="size-12" src={logoPath} alt="City of Cabuyao Logo"/> : ""}
        </header>
    );
}
