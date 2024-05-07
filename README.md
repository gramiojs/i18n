# @gramio/i18n

`i18n` plugin for [GramIO](https://gramio.netlify.app/).

This plugin provide internationalization for your bots with [Fluent](https://projectfluent.org/) syntax.

![example](https://github.com/gramiojs/i18n/assets/57632712/47e04c22-f442-4a5a-b8b9-15b8512f7c4b)

You can [setup type-safety](#type-safety) for it.

## Usage

### Create `locales` folder with `en.ftl` file

```ftl
# Simple things are simple.
hello-user = Hello, {$userName}!

# Complex things are possible.
shared-photos =
    {$userName} {$photoCount ->
        [one] added a new photo
       *[other] added {$photoCount} new photos
    } to {$userGender ->
        [male] his stream
        [female] her stream
       *[other] their stream
    }.
```

> [!IMPORTANT]
> Fluent language support extensions for [VSCode](https://marketplace.visualstudio.com/items?itemName=macabeus.vscode-fluent) and [WebStorm](https://plugins.jetbrains.com/plugin/18416-fluent-language)

### Use plugin

```ts
// src/index.ts
import { Bot } from "gramio";
import { i18n } from "@gramio/i18n";

const bot = new Bot(process.env.TOKEN as string)
    .extend(i18n())
    .command("start", async (context) => {
        return context.send(
            context.t("shared-photos", {
                userName: "Anna",
                userGender: "female",
                photoCount: 3,
            })
        );
    })
    .onError(console.error)
    .onStart(console.log);

bot.start();
```

## Options

| Key            | Type   | Default   | Description                               |
| -------------- | ------ | --------- | ----------------------------------------- |
| defaultLocale? | string | "en"      | Default locale                            |
| directory?     | string | "locales" | The path to the folder with `*.ftl` files |

### Methods

#### t

Using this method, you can get the text in your chosen language.

For example:

```ftl
hello-user = Hello, {$userName}!
```

```ts
context.t("hello-user", { userName: "Anna" }); // Hello, Anna!
```

#### setLocale

You can set user locale by `setLocale` method.

> [!WARNING]
> At the moment, there is no integration with sessions, and therefore, after the message, the language will again become the one that defaultLocale

```ts
bot.command("start", async (context) => {
    context.setLocale("ru");

    return context.send(
        context.t("shared-photos", {
            userName: "Anna",
            userGender: "female",
            photoCount: 3,
        })
    );
});
```

## Type-safety

You can use this plugin with [fluent2ts](https://github.com/kravetsone/fluent2ts) which code-generates typescript types from your `.ftl` files.
See [usage](https://github.com/kravetsone/fluent2ts?tab=readme-ov-file#usage).

Npm:

```bash [npm]
npx fluent2ts
```

Bun:

```bash [bun]
bunx fluent2ts
```

Yarn:

```bash [yarn]
yarn dlx fluent2ts
```

Pnpm:

```bash [pnpm]
pnpm exec fluent2ts
```

And so we have a generated `locales.types.ts` file in `src` folder that exports the `TypedFluentBundle` interface.
We set this type as a **generic** for the `i18n` plugin. And now we have **type-safety**!

```ts
import type { TypedFluentBundle } from "./locales.types";
import { Bot } from "gramio";
import { i18n } from "@gramio/i18n";

const bot = new Bot(process.env.TOKEN as string)
    .extend(i18n<TypedFluentBundle>())
    .command("start", async (context) => {
        return context.send(
            context.t("shared-photos", {
                userName: "Anna",
                userGender: "female",
                photoCount: 3,
            })
        );
    })
    .onError(console.error)
    .onStart(console.log);

bot.start();
```
