import Image from "next/image";

export default function Header() {
    return (
        <header className = "bg-white text-[#9a251d] flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center">
                <Image
                    src="/CommunityShop.png"
                    alt = "Gamecock CommUnity Shop Logo"
                    width = {150}
                    height = {150}
                />
            </div>

            <div className="flex-1 text-center">
                <h1 className="m-0 text-2xl font-bold">
                    Gamecock CommUnity Shop
                </h1>
                <p className="m-0 text-sm">
                    4000 Suite, Caroline Coliseum
                </p>
            </div>
        </header>
    );
}
