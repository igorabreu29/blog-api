import { app } from "@/app.ts";
import { env } from "@/env/index.ts";

const url = await app.listen({ port: env.PORT })
console.log(`Server running on url ${url}`)