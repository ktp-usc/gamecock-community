import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t bg-white px-6 py-6 text-sm text-gray-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-semibold text-slate-900">Gamecock Community Shop</p>
          <p>701 Assembly St, Columbia, SC 29210</p>
          <p>Volunteer check-in and time tracking portal.</p>
        </div>

        <div className="flex justify-center md:justify-end">
          <Image
            src="/usc-logos/usc-logo-horizontal.png"
            alt="University of South Carolina"
            width={180}
            height={36}
            className="h-auto w-[180px]"
          />
        </div>
      </div>
    </footer>
  );
}
