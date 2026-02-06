import type { PropsWithChildren } from "react";
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

      <main>{children}</main>

      <Footer title={title} />
    </div>
  );
}
