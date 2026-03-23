export type Ok<T> = {
  ok: true;
  data: T;
};

export type Err<Code extends string = string> = {
  ok: false;
  code: Code;
  error: string;
};

export type Result<T, Code extends string = string> = Ok<T> | Err<Code>;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err<Code extends string>(code: Code, error: string): Err<Code> {
  return { ok: false, code, error };
}
