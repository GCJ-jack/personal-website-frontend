import type { PropsWithChildren } from "react";

type PageProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  intro?: string;
}>;

export function Page({ title, subtitle, intro, children }: PageProps) {
  return (
    <div>
      <section>
        <h1>{title}</h1>
        {subtitle ? <p className="small">{subtitle}</p> : null}
        {intro ? <p>{intro}</p> : null}
      </section>
      {children}
    </div>
  );
}
