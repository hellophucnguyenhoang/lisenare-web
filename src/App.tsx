import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { RequestError } from "@/api/client";
import { apiLogout } from "@/api/auth";
import { useLearnerMe } from "@/hooks/useLearner";
import { type ActiveTab, type AuthMode, type Subview } from "@/types";

import BricksPage from "@/pages/BricksPage";
import SearchPage from "@/pages/SearchPage";
import DiscoverPage from "@/pages/DiscoverPage";
import RetrievalPage from "@/pages/RetrievalPage";
import ProfilePage from "@/pages/ProfilePage";
import AddBrickPage from "@/pages/AddBrickPage";
import EditBrickPage from "@/pages/EditBrickPage";
import AuthModal from "@/components/auth/AuthModal";
import AppHeader from "@/components/layout/AppHeader";
import { HeaderProvider, useHeader } from "@/context/HeaderContext";

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
  const { setHeaderContent } = useHeader();
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [hasInitializedTab, setHasInitializedTab] = useState(false);
  const [subview, setSubview] = useState<Subview>(null);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);
  const [retrievalBrickId, setRetrievalBrickId] = useState<number | null>(null);
  const [retrievalFinishedCount, setRetrievalFinishedCount] = useState(0);
  const [retrievalElapsedSeconds, setRetrievalElapsedSeconds] = useState(0);

  // Set initial tab on load/reload based on authentication state
  useEffect(() => {
    if (!hasInitializedTab && !isCheckingAuth) {
      if (learner) {
        setActiveTab("retrieval");
      } else {
        setActiveTab("profile");
      }
      setHasInitializedTab(true);
    }
  }, [hasInitializedTab, isCheckingAuth, learner]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      queryClient.clear();
      queryClient.setQueryData(["learner", "me"], null);
      setHeaderContent(null);
      setRetrievalBrickId(null);
      setRetrievalFinishedCount(0);
      setRetrievalElapsedSeconds(0);
      setSubview(null);
      setActiveTab("profile");
      toast.success("Logged out successfully");
    }
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
          islandId={subview.islandId}
          onBack={() => setSubview(null)}
        />
        <Toaster position="bottom-center" richColors />
      </>
    );
  }

  if (subview?.type === "editBrick") {
    return (
      <>
        <EditBrickPage brick={subview.brick} onBack={() => setSubview(null)} />
        <Toaster position="bottom-center" richColors />
      </>
    );
  }

  if (subview?.type === "search") {
    return (
      <>
        <SearchPage
          onBack={() => setSubview(null)}
          onNavigateToRetrieval={(brickId) => {
            setRetrievalBrickId(brickId ?? null);
            setSubview(null);
            setActiveTab("retrieval");
          }}
          onNavigateToEditBrick={(brick) => {
            setSubview({ type: "editBrick", brick });
          }}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
        />
        <Toaster position="bottom-center" richColors />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "bricks":
        return (
          <BricksPage
            onNavigateToAddBrick={(islandId) => {
              setSubview({ type: "addBrick", islandId });
            }}
            onNavigateToEditBrick={(brick) => {
              setSubview({ type: "editBrick", brick });
            }}
            onNavigateToRetrieval={(brickId) => {
              setRetrievalBrickId(brickId ?? null);
              setActiveTab("retrieval");
            }}
            onNavigateToSearch={() => setSubview({ type: "search" })}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
          />
        );
      case "discover":
        return <DiscoverPage />;
      case "retrieval":
        return (
          <RetrievalPage
            targetBrickId={retrievalBrickId}
            onClearTargetBrickId={() => setRetrievalBrickId(null)}
            onNavigateToAddBrick={() => setSubview({ type: "addBrick" })}
            onNavigateToEditBrick={(brick) =>
              setSubview({ type: "editBrick", brick })
            }
            finishedCount={retrievalFinishedCount}
            onIncrementFinishedCount={() =>
              setRetrievalFinishedCount((prev) => prev + 1)
            }
            elapsedSeconds={retrievalElapsedSeconds}
            onTickTimer={() => setRetrievalElapsedSeconds((prev) => prev + 1)}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
          />
        );
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
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Sticky Header Bar with Lisenare Logo and Dynamic Tab Content */}
      <AppHeader
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (!learner && (tab === "retrieval" || tab === "bricks")) {
            setAuthModalMode("login");
            return;
          }
          if (tab === "retrieval") {
            setRetrievalBrickId(null);
          }
          setActiveTab(tab);
        }}
        clearSubviews={() => setSubview(null)}
        isLoggedIn={Boolean(learner)}
        onClearRetrievalBrickId={() => setRetrievalBrickId(null)}
      />

      {/* Main screen area dedicated strictly to displaying the scrollable content */}
      <main className="flex-1 w-full flex flex-col pt-14 sm:pt-16 pb-6 sm:pb-8">
        {renderTab()}
      </main>

      <AuthModal
        isOpen={Boolean(authModalMode)}
        initialMode={authModalMode || "login"}
        onClose={() => setAuthModalMode(null)}
        onSuccess={() => {
          setActiveTab("retrieval");
        }}
      />

      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HeaderProvider>
        <AppContent />
      </HeaderProvider>
    </QueryClientProvider>
  );
}
