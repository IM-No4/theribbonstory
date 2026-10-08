import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { useSeo } from "../utils/seo";

export default function NotFound() {
  useSeo({ title: "Page Not Found", noindex: true });
  return (
    <div className="container-page py-24 text-center flex flex-col items-center">
      <LogoMark to="/" size="compact" />
      <p className="mt-10 text-7xl font-display text-ribbon-200">404</p>
      <h1 className="mt-2 text-2xl font-display text-espresso-600">This page didn&apos;t make it into the story</h1>
      <p className="mt-2 text-sm text-espresso-400">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to Home</Link>
    </div>
  );
}
