import Link from "next/link";
import Image from "next/image";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="hidden items-center lg:flex">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <p className="ml-2.5 text-2xl font-semibold">Finance</p>
      </div>
    </Link>
  );
};
