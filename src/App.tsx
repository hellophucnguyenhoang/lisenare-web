import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { request, RequestError } from "@/api/client";
import { useLearnerMe } from "@/hooks/useLearner";
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

function AppContent() {
  const { data: learner, isLoading: isCheckingAuth } = useLearnerMe();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  const [subview, setSubview] = useState<Subview>(null);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);

  // Set initial tab on load/reload based on authentication state
  useEffect(() => {
    if (!hasInitializedTab && !isCheckingAuth) {
      if (learner) {
        setActiveTab("practice");
      } else {
        setActiveTab("profile");
      }
      setHasInitializedTab(true);
    }
  }, [hasInitializedTab, isCheckingAuth, learner]);

  const handleLogout = async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    queryClient.clear();
    setActiveTab("profile");
    toast.success("Logged out successfully");
  };

  if (isCheckingAuth && !hasInitializedTab) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render subview pages (overlays on top of tabs)
  if (subview?.type === "addBrick") {
    return (
      <>
        <AddBrickPage
          collectionId={subview.collectionId}
          onBack={() => setSubview(null)}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  if (subview?.type === "editBrick") {
    return (
      <>
        <EditBrickPage brick={subview.brick} onBack={() => setSubview(null)} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "collections":
        return (
          <CollectionsPage
            selectedCollectionId={selectedCollectionId}
            onSelectCollection={setSelectedCollectionId}
            onNavigateToAddBrick={(collectionId) => {
              setSelectedCollectionId(collectionId);
              setSubview({ type: "addBrick", collectionId });
            }}
            onNavigateToEditBrick={(brickId) => {
              const cached = queryClient.getQueriesData<{ items: Brick[] }>({
                queryKey: ["bricks"],
              });
              const brick = cached
                .flatMap(([, data]) => data?.items ?? [])
                .find((b) => b.id === brickId);
              if (brick) {
                setSelectedCollectionId(brick.collectionId);
                setSubview({ type: "editBrick", brick });
              }
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
    <div className="min-h-screen bg-surface pb-20">
      {renderTab()}

      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clearSubviews={() => setSubview(null)}
      />

      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || "login"}
        onClose={() => setAuthModalMode(null)}
        onSuccess={() => {
          setActiveTab("practice");
        }}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
