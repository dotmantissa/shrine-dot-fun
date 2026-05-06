import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Jost:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
          :root { --parch:#F6F3EE; --stone:#E8E3DA; --line:#D4CFC6; --mid:#9A9288; --ink:#1C1915; --deep:#2E2B26; --accent:#8B2635; --accent-dim:rgba(139,38,53,0.08); --gold:#9A7B4F; --up:#2D6A2D; }
          html.dark { --parch:#0F0E0C; --stone:#1A1916; --line:#2E2B26; --mid:#6B6560; --ink:#EAE6DF; --deep:#C4BFB7; --accent:#C0404F; --accent-dim:rgba(192,64,79,0.10); --gold:#B8965E; --up:#3D8B3D; }
          * { box-sizing: border-box; border-radius: 0; }
          html, body { margin: 0; background: var(--parch); color: var(--ink); font-family: "Jost", sans-serif; }
          a { color: inherit; }
          input, textarea, select, button { font: inherit; }
        `}</style>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
