// Local/Termux dev entrypoint. On Vercel, api/index.ts imports the same
// `app` and Vercel's Node runtime handles listening.
//
// Port: the API is conventionally fixed to 3000 (README, package.json
// scripts, constants/api.ts). process.env.PORT is deliberately NOT used —
// sandbox previews inject PORT for the Metro/preview port (8081), which must
// stay free for `expo start`. Override locally with API_PORT if ever needed.
import { app } from "./app";

const port = parseInt(process.env.API_PORT || "3000", 10);
app.listen(port, () => {
  console.log(`Elav8 API listening on http://localhost:${port}`);
});
