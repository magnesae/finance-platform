import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function Page() {
  return (
    <form action={signOut}>
      <Button variant="secondary">Sign out</Button>
    </form>
  );
}
