import { Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { DateContext } from "~/utils/client/DateContext";

export async function loader() {
  const date = new Date();

  return json({
    serverDate: date.getDate().toString(),
    serverMonth: String(date.getMonth() + 1),
    serverYear: date.getFullYear().toString(),
  });
}

export default function Dashboard() {
  const { serverMonth, serverYear, serverDate } =
    useLoaderData<typeof loader>();
  const [date, setDate] = useState(serverDate);
  const [month, setMonth] = useState(serverMonth);
  const [year, setYear] = useState(serverYear);

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
