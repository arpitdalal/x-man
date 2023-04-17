import { NavLink, useLocation } from "@remix-run/react";

type LinkTabsProps = {
  links: Array<{
    label: string;
    url: string;
  }>;
};
export default function LinkTabs({ links }: LinkTabsProps) {
  const location = useLocation();
  return (
    <div className="mt-4 w-[400px]">
      <div className="inline-flex items-center justify-center rounded-md bg-night-200 p-1 dark:bg-night-700">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={`${link.url}${location.search}`}
            className={({ isActive }) => {
              return `inline-flex min-w-[100px] items-center justify-center rounded-[0.185rem] px-3 py-1.5  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50${
                isActive
                  ? " bg-white text-night-700 shadow-sm dark:bg-accent-purple dark:text-day-100"
                  : ""
              }`;
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
