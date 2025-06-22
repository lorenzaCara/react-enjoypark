import { DesktopHeader } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

export default function ResponsiveHeader({ showMobileNav }) {
  return (
    <>
      <DesktopHeader />

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
