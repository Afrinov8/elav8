// Local/Termux dev entrypoint — listens on PORT. On Vercel, api/[...path].ts
// imports the same `app` and Vercel's Node runtime handles listening.
import { app } from "./app";

const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => {
  console.log(`Elav8 API listening on http://localhost:${port}`);
});
