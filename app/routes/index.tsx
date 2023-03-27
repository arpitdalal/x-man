import MyLinkBtn from "~/components/MyLinkBtn";

export default function Index() {
  return (
    <div className="h-screen flex items-center justify-center flex-col px-5 lg:px-20">
      <div className="max-w-8xl mx-auto text-center">
        <h1 className="text-5xl">X-Man</h1>
        <p className="text-2xl max-w-3xl mt-3">
          Your personalized e<span className="text-accent-purple">X</span>pense{" "}
          <span className="text-accent-purple">MAN</span>ager
        </p>
        <div className="mt-8 flex gap-8 justify-center">
          <MyLinkBtn to="register" size="lg">
            Register
          </MyLinkBtn>
          <MyLinkBtn to="login" size="lg">
            Login
          </MyLinkBtn>
        </div>
      </div>
    </div>
  );
}
