import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DateContext } from "~/utils/client/DateContext";

export async function loader() {
  const date = new Date();

  return json({
    serverMonth: String(date.getMonth() + 1),
    serverYear: date.getFullYear().toString(),
    serverDate: date.getDate().toString(),
  });
}

export default function Dashboard() {
  const { serverMonth, serverYear, serverDate } =
    useLoaderData<typeof loader>();
  const [date, setDate] = useState<string>(serverDate);
  const [month, setMonth] = useState<string>(serverMonth);
  const [year, setYear] = useState<string>(serverYear);

  useEffect(() => {
    const date = new Date();
    setDate(String(date.getDate()));
    setMonth(String(date.getMonth() + 1));
    setYear(String(date.getFullYear()));
  }, []);

  return (
    <DateContext.Provider value={{ date, month, year }}>
      <Outlet />
    </DateContext.Provider>
  );
}
