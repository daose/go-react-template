export function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <script defer src="/app.js" />
        <link rel="stylesheet" href="/styles.css" />
        <title>Baguette</title>
      </head>
      <body>
        <div>
          <div>hello world</div>
          <button onClick={() => console.log("hi")}>hi</button>
        </div>
      </body>
    </html>
  );
}
