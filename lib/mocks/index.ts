export async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  if (process.env.NEXT_PUBLIC_API_MOCKING === "false") {
    return;
  }
  const { worker } = await import("./browser");
  return worker.start();
}
