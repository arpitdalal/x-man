import FullPageCenter from "~/components/FullpageCenter";
import MyLink from "~/components/MyLink";
import useRedirectTo from "~/hooks/useRedirectTo";

export default function LoginMessage() {
  const redirectTo = useRedirectTo();

  return (
    <FullPageCenter
      title="You are not logged in"
      message={
        <>
          Please <MyLink to={`/login?redirectTo=${redirectTo}`}>Login</MyLink>{" "}
          to continue
        </>
      }
    />
  );
}
