---
id: nestjs-config-for-root-async
stack: nestjs
domain: nestjs-modules
group: configuration
status: active
replaced_by: null
since: 2026-05-01
tags:
  - nestjs
  - modules
  - openapi
priority: medium
related: []
---

# `forRootAsync` for modules with dependent configuration

Hard-coded module config — environments differ only by editing code.

## Why it matters

- [hard-to-change] Hard-coded module config — staging and prod need code edits or duplicate modules to differ.
- [hard-to-test] Config baked into the module — tests reach for process.env instead of injecting values.


## How to fix

A module that needs configuration (DB connection, API key) provides a static `forRoot` / `forRootAsync`. Without it, you slide back to singletons and global state.

## Incorrect

```typescript
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: new Redis(process.env.REDIS_URL!),   // ← bound to env, not to config
    },
  ],
})
export class RedisModule {}
```

## Correct

```typescript
@Module({})
export class RedisModule {
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<RedisOptions> | RedisOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async (...args) => new Redis(await options.useFactory(...args)),
          inject: options.inject,
        },
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}

// app.module.ts
RedisModule.forRootAsync({
  useFactory: (config: ConfigService) => ({ url: config.get('REDIS_URL') }),
  inject: [ConfigService],
})
```
