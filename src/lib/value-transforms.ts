export function toBoolean(value: number | boolean) {
  return Boolean(value);
}

export function toSqliteBoolean(value: boolean) {
  return value ? 1 : 0;
}
