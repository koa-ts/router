import Koa from 'koa';
import KoaRouter from 'koa-router';
import * as _ from 'lodash-es';
import { RouteHandler } from './route-handler';
import { Router } from './router';

/**
 * Merge object types rewriting properties of first one
 * @typeParam T - source type
 * @typeParam V - overwrite type
 * @example
 * ```
 * type A = { a: number, b: string }
 * type B = { b: boolean }
 * type Result = Rewrite<A, B> // Result = { a: number, b: boolean };
 * ```
 */
export type Rewrite<T, V> = Omit<T, keyof V> & V;

/**
 * Promise or value of type V
 * @typeParam V - source type
 * @example
 * ```
 * PromiseOr<number>; // = number | Promise<number>
 * ```
 */
export type PromiseOr<T> = T | Promise<T>;

/**
 * http methods
 */
export type MethodsType =
  | 'get'
  | 'post'
  | 'put'
  | 'del'
  | 'patch'
  | 'head'
  | 'options'
  | 'link'
  | 'unlink'
  | 'all';

export const MethodsArray = [
  'get',
  'post',
  'put',
  'del',
  'patch',
  'head',
  'options',
  'link',
  'unlink',
  'all',
];

/**
 * Koats middleware function with parametrized state.
 * If you call next() manually you MUST guarantee you update ctx.state according to return type
 * @typeParam State - type of incoming ctx.state
 * @typeParam Return - return type of middleware
 * @example
 * ```
 * const mw: Middleware<{ num: number }> = (ctx, next) => {
 *   ctx.state.num; // accessible state property
 *   return { str: 'string' }; // will be placed in context.state
 * };
 * ```
 */
export type MiddlewareFunction<State = unknown, Return = unknown> = (
  ctx: Koa.ParameterizedContext<State, KoaRouter.IRouterParamContext>,
  next: Koa.Next,
) => PromiseOr<Return>;

/**
 * Meta-callback for routers and handlers
 */
export type MetaCallback = (
  router: Router<string, MethodsType>,
  handler?: RouteHandler<string, MethodsType, string>,
) => void;

/**
 * Middleware metadata utility keys
 */
export enum MetaKeys {
  metaCallback = 'metaCallback',
  ignoreMiddleware = 'ignoreMiddleware',
  ignoreMeta = 'ignoreMeta',
}

export type MiddlewareMetadata = {
  [MetaKeys.metaCallback]?: MetaCallback;
  [MetaKeys.ignoreMiddleware]?: boolean;
  [MetaKeys.ignoreMeta]?: boolean;
};

/**
 * Middleware with metadata
 */
export type Middleware<State = unknown, Return = unknown> = MiddlewareFunction<
  State,
  Return
> &
  MiddlewareMetadata;

/**
 * Converts Koats middleware to default koa middleware
 * @param mw - koats middleware
 */
export function toKoaMiddleware(mw: Middleware): KoaRouter.IMiddleware {
  return async (ctx, next) => {
    next = _.once(next);
    const res = await mw(ctx, next);
    Object.assign(ctx.state, res);
    return next();
  };
}
