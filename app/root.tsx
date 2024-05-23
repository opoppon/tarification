import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import bootstrapCSS from "bootstrap/dist/css/bootstrap.min.css"
import logo from "../public/logo-reso.png";
import { LinksFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Tarification",
  viewport: "width=device-width,initial-scale=1",
});


export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: bootstrapCSS,
    },
  ];
};
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header><img src={logo} width={180}/></header>
        <main className="container-sm mt-3">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
