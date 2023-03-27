import { Outlet, useNavigate } from "@remix-run/react";
import { useContext, useEffect } from "react";
import MyLink from "~/components/MyLink";
import { DateContext } from "~/utils/client/DateContext";

export default function Dashboard() {
  const { month, year } = useContext(DateContext);
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`${year}/${month}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const monthSuffix =
    month === "1" ? "st" : month === "2" ? "nd" : month === "3" ? "rd" : "th";

  return (
    <>
      <div>
        <Outlet />
      </div>
      <noscript>
        <div className="mt-10 flex items-center justify-center flex-col px-5 lg:px-20">
          <div className="max-w-8xl mx-auto text-center">
            <h1 className="text-5xl">Oops</h1>
            <p className="mt-3 text-2xl">
              It looks like JavaScript didn't load or it is disabled by your
              browser.
            </p>
            <p className="mt-3 text-2xl">
              We couldn't redirect you to the current year and month, please
              click <MyLink to={`${year}/${month}`}>here</MyLink> to go to{" "}
              {month}
              {monthSuffix} month of {year}
            </p>
            <p className="mt-3 text-xl">
              {" "}
              The month and year might not be accurate. To get accurate month
              and year, reload the page if JavaScript didn't load because of bad
              network connection or enable JavaScript in your browser.
            </p>
          </div>
        </div>
      </noscript>
    </>
  );
}
