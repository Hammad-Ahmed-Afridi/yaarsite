// This file defines common types for Next.js App Router pages and layouts.

/**
 * Interface for dynamic route parameters, specifically for tenantSlug.
 */
interface DynamicRouteParams {
  tenantSlug: string;
}

/**
 * Interface for page props in Next.js App Router, including dynamic parameters.
 * @template P The type of the dynamic route parameters. Defaults to DynamicRouteParams.
 */
interface PageProps<P = DynamicRouteParams> {
  params: P;
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Interface for layout props in Next.js App Router, including children and dynamic parameters.
 * @template P The type of the dynamic route parameters. Defaults to DynamicRouteParams.
 */
interface LayoutProps<P = DynamicRouteParams> {
  children: React.ReactNode;
  params: P;
}