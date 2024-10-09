# @gramio/i18n

[![npm](https://img.shields.io/npm/v/@gramio/i18n?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@gramio/i18n)
[![JSR](https://jsr.io/badges/@gramio/i18n)](https://jsr.io/@gramio/i18n)
[![JSR Score](https://jsr.io/badges/@gramio/i18n/score)](https://jsr.io/@gramio/i18n)

`i18n` plugin for [GramIO](https://gramio.dev/).

This plugin provide good way to add internationalization for your bots! It can be used without GramIO, but it will always keep it in mind.

> [!IMPORTANT]
> Since `1.0.0`, we have two ways to write localization: [`I18n-in-TS`](#i18n-in-ts-syntax) and [`Fluent`](#fluent-syntax)

## I18n-in-TS syntax

> [!WARNING]
> This syntax under active development

This syntax allows you to write localization without leaving `.ts` files and does not require code-generation for **type-safety**, as well as provides convenient integration with the Format API out of the box!

```ts
import { defineI18n } from "@gramio/i18n";

const en = {
    greeting: (name: string) => format`Hello, ${name}!`,
};

const ru: ShouldFollowLanguage<typeof en> = {
    greeting: (name: string) => format`Привет, ${name}!`,
};

// Strict will show error on missing keys
// const ru: ShouldFollowLanguageStrict<typeof en> = {};

const i18n = defineI18n({
    primaryLanguage: "en",
    languages: {
        en,
        ru,
    },
});

i18n.t("en", "greeting", "World"); // Hello, World!

const bot = new Bot(process.env.BOT_TOKEN as string)
    .derive("message", (context) => {
        // u can take language from database or whatever u want and bind it to context without loosing type-safety
        return {
            t: i18n.buildT(context.from?.languageCode ?? "en"),
        };
    })
    .on("message", (context) => {
        return context.send(
            context.t("greeting", context.from?.firstName ?? "World")
        );
    });
```

`ExtractLanguages` helps you extract languages types from i18n instance.

```ts
type EnLocalizationKeys = keyof ExtractLanguages<typeof i18n>["en"];
```

## [Fluent](https://projectfluent.org/) syntax

This plugin provide internationalization for your bots with [Fluent](https://projectfluent.org/) syntax.

![example](https://github.com/gramiojs/i18n/assets/57632712/47e04c22-f442-4a5a-b8b9-15b8512f7c4b)

You can [setup type-safety](#type-safety) for it.

## Usage

### Create `locales` folder with `en.ftl` file

```fluent
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
import { i18n } from "@gramio/i18n/fluent";

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

| Key            | Type   | Default               | Description                               |
| -------------- | ------ | --------------------- | ----------------------------------------- |
| defaultLocale? | string | first loaded language | Default locale                            |
| directory?     | string | "locales"             | The path to the folder with `*.ftl` files |

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

#### i18n.setLocale

You can set user locale by `setLocale` method.

> [!WARNING]
> At the moment, there is no integration with sessions, and therefore, after the message, the language will again become the one that defaultLocale

```ts
bot.command("start", async (context) => {
    context.i18n.setLocale("ru"); // if ru not found fallback to defaultLocale
    // context.i18n.setLocale("ru", true); if ru not found throw error

    return context.send(
        context.t("shared-photos", {
            userName: "Anna",
            userGender: "female",
            photoCount: 3,
        })
    );
});
```

#### i18n.locale

Get current user locale.

```ts
bot.command("lang", async (context) => {
    return context.send(context.i18n.locale);
});
```

#### i18n.locales

Get loaded locales

```ts
bot.command("languages", async (context) => {
    return context.send(context.i18n.locales.join(", "));
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
import { i18n } from "@gramio/i18n/fluent";

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
