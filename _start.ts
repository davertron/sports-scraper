// Use concurrently to run the server and the frontend
import { concurrently } from "npm:concurrently";

concurrently([
    {command: "deno task serve", name: "serve", prefixColor: "blue"},
    {command: "deno task fe", name: "fe", prefixColor: "green"}
]);