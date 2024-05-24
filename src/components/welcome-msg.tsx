import { validateRequest } from "@/lib/auth";

export const WelcomeMsg = async () => {
  const { user } = await validateRequest();

  return (
    <div className="mb-4 space-y-2">
      <h2 className="fond-medium text-2xl text-white lg:text-4xl ">
        Welcome Back, {user?.username}
      </h2>
      <p className="text-sm text-white/60 lg:text-base">
        This is your Financal Dashboard. Here you can track your expenses,
        income, and more.
      </p>
    </div>
  );
};
