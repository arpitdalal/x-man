import FullPageCenter from "~/components/FullpageCenter";
import MyLink from "~/components/MyLink";
import useRedirectTo from "~/hooks/useRedirectTo";

export default function LoginMessage({
  redirectUrl,
}: {
  redirectUrl?: string;
}) {
  const redirectTo = useRedirectTo() || "/app/dashboard";

  return (
    <FullPageCenter
      title="You are not logged in"
      message={
        <>
          Please{" "}
          <MyLink to={`/login?redirectTo=${redirectUrl || redirectTo}`}>
            Login
          </MyLink>{" "}
          to continue
        </>
      }
    />
  );
}
