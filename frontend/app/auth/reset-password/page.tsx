import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const idParam = searchParams?.id;
  const secretParam = searchParams?.secret;
  const id = Array.isArray(idParam) ? idParam[0] : (idParam ?? null);
  const secret = Array.isArray(secretParam)
    ? secretParam[0]
    : (secretParam ?? null);

  return <ResetPasswordClient id={id} secret={secret} />;
}
