import { DesktopHeader } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export default function ResponsiveHeader({ showMobileNav }) {
  return (
    <>
      {/* Desktop Header - only visible on lg screens and up */}
      <DesktopHeader />

      {/* Mobile Navigation - only visible on screens smaller than lg */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          showMobileNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <MobileNav />
      </div>
    </>
  )
}
