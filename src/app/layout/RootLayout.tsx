import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

type RootLayoutProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function RootLayout({
  title = "Personal Site",
  description = "",
  children,
}: RootLayoutProps) {
  return (
    <div>
      <Header title={title} description={description} />

      <main>{children ?? <Outlet />}</main>

      <Footer title={title} />
    </div>
  );
}
