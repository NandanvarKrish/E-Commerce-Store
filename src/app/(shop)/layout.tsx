import { ShopHeader } from "@/components/layout/shop-header";
import { ShopFooter } from "@/components/layout/shop-footer";
import { SearchModal } from "@/components/layout/search-modal";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { AiAssistantDrawer } from "@/components/layout/ai-assistant-drawer";
import { AiAssistantTrigger } from "@/components/layout/ai-assistant-trigger";
import { Toaster } from "@/components/ui/toast";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
      {/* Global Client Overlays & Notifications */}
      <SearchModal />
      <CartDrawer />
      <AiAssistantDrawer />
      <AiAssistantTrigger />
      <Toaster />
    </div>
  );
}
