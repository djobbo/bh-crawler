import { Context } from "effect"

export class API extends Context.Tag("API")<
  API,
  {
    readonly baseUrl: string
    readonly key: string
  }
>() {}
