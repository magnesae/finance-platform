import { Filters } from "@/components//filters";
import { HeaderLogo } from "@/components/header-logo";
import { Navigation } from "@/components/navigation";
import SignOutButton from "@/components/sign-out-button";
import { WelcomeMsg } from "@/components/welcome-msg";

export const Header = () => {
  return (
    <header className="bg-gradient-to-b from-zinc-900 to-zinc-700 px-4 py-8 pb-36 text-white lg:px-14">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-14 flex w-full items-center justify-between">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <SignOutButton />
        </div>
        <WelcomeMsg />
        <Filters />
      </div>
    </header>
  );
};
