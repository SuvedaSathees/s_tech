import { lazy, Suspense, type ComponentType } from "react";
// Minimal next/dynamic stand-in for the static preview bundle.
export default function dynamic<P extends object>(loader: () => Promise<{ default: ComponentType<P> }>) {
  const L = lazy(loader);
  return function Dyn(props: P) {
    return (
      <Suspense fallback={null}>
        <L {...props} />
      </Suspense>
    );
  };
}
