import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { request, RequestError } from "@/api/client";
import {
  type Brick,
  type ActiveTab,
  type AuthMode,
  type Subview,
} from "@/types";

import CollectionsPage from "@/pages/CollectionsPage";
import DiscoverPage from "@/pages/DiscoverPage";
import PracticePage from "@/pages/PracticePage";
import ProfilePage from "@/pages/ProfilePage";
import AddBrickPage from "@/pages/AddBrickPage";
import EditBrickPage from "@/pages/EditBrickPage";
import AuthModal from "@/components/auth/AuthModal";
import BottomNavBar from "@/components/layout/BottomNavBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      onError: (error) => {
        if (error instanceof RequestError) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      },
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("practice");
  const [subview, setSubview] = useState<Subview>(null);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);

  const handleLogout = async () => {
    await request("/auth/logout", { method: "POST" });
    queryClient.clear();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  // Render subview pages (overlays on top of tabs)
  if (subview?.type === "addBrick") {
    return (
      <QueryClientProvider client={queryClient}>
        <AddBrickPage
          collectionId={subview.collectionId}
          onBack={() => setSubview(null)}
        />
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    );
  }

  if (subview?.type === "editBrick") {
    return (
      <QueryClientProvider client={queryClient}>
        <EditBrickPage brick={subview.brick} onBack={() => setSubview(null)} />
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "collections":
        return (
          <CollectionsPage
            onNavigateToAddBrick={(collectionId) =>
              setSubview({ type: "addBrick", collectionId })
            }
            onNavigateToEditBrick={(brickId) => {
              const cached = queryClient.getQueriesData<{ items: Brick[] }>({
                queryKey: ["bricks"],
              });
              const brick = cached
                .flatMap(([, data]) => data?.items ?? [])
                .find((b) => b.id === brickId);
              if (brick) setSubview({ type: "editBrick", brick });
            }}
            onNavigateToPractice={() => setActiveTab("practice")}
          />
        );
      case "discover":
        return <DiscoverPage />;
      case "practice":
        return <PracticePage />;
      case "profile":
        return (
          <ProfilePage
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-surface pb-20">
        {renderTab()}

        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clearSubviews={() => setSubview(null)}
        />
      </div>

      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || "login"}
        onClose={() => setAuthModalMode(null)}
      />

      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TestCookie />

//       <Toaster position="top-center" richColors />
//     </QueryClientProvider>
//   );
// }
