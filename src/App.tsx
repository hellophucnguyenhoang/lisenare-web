import { useState, lazy, Suspense, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { RequestError } from "@/api/client";
import { apiLogout } from "@/api/auth";
import { useLearnerMe } from "@/hooks/useLearner";
import { type ActiveTab, type AuthMode, type Subview } from "@/types";

import AppHeader from "@/components/layout/AppHeader";
import { HeaderProvider, useHeader } from "@/context/HeaderContext";

// Lazy-loaded pages and heavy modals for code-splitting
const BricksPage = lazy(() => import("@/pages/BricksPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"));
const PracticePage = lazy(() => import("@/pages/PracticePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AddBrickPage = lazy(() => import("@/pages/AddBrickPage"));
const EditBrickPage = lazy(() => import("@/pages/EditBrickPage"));
const AuthModal = lazy(() => import("@/components/auth/AuthModal"));

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

function PageLoadingFallback() {
  return (
    <div className="flex-1 w-full min-h-[50vh] flex items-center justify-center p-8 animate-in fade-in duration-200">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { data: learner, isLoading: isCheckingAuth } = useLearnerMe();
  const { setHeaderContent } = useHeader();
  const [selectedTab, setSelectedTab] = useState<ActiveTab | null>(null);
  const [subview, setSubview] = useState<Subview>(null);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);
  const [practiceBrickId, setPracticeBrickId] = useState<number | null>(null);
  const [practiceFinishedCount, setPracticeFinishedCount] = useState(0);
  const [practiceElapsedSeconds, setPracticeElapsedSeconds] = useState(0);

  // Derive active tab cleanly without cascading effect setState
  const activeTab: ActiveTab =
    selectedTab ?? (learner ? "practice" : "profile");

  const handleSelectTab = useCallback(
    (tab: ActiveTab) => {
      if (!learner && (tab === "practice" || tab === "bricks")) {
        setAuthModalMode("login");
        return;
      }
      if (tab === "practice") {
        setPracticeBrickId(null);
      }
      setSelectedTab(tab);
    },
    [learner],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      queryClient.clear();
      queryClient.setQueryData(["learner", "me"], null);
      setHeaderContent(null);
      setPracticeBrickId(null);
      setPracticeFinishedCount(0);
      setPracticeElapsedSeconds(0);
      setSubview(null);
      setSelectedTab("profile");
      toast.success("Logged out successfully");
    }
  }, [setHeaderContent]);

  if (isCheckingAuth && selectedTab === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render subview pages (overlays on top of tabs)
  if (subview?.type === "addBrick") {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <AddBrickPage
          collectionId={subview.collectionId}
          onBack={() => setSubview(null)}
        />
        <Toaster position="top-center" richColors />
      </Suspense>
    );
  }

  if (subview?.type === "editBrick") {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <EditBrickPage brick={subview.brick} onBack={() => setSubview(null)} />
        <Toaster position="top-center" richColors />
      </Suspense>
    );
  }

  if (subview?.type === "search") {
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <SearchPage
          onBack={() => setSubview(null)}
          onNavigateToPractice={(brickId) => {
            setPracticeBrickId(brickId ?? null);
            setSubview(null);
            setSelectedTab("practice");
          }}
          onNavigateToEditBrick={(brick) => {
            setSubview({ type: "editBrick", brick });
          }}
          onOpenAuth={(mode) => setAuthModalMode(mode)}
        />
        <Toaster position="top-center" richColors />
      </Suspense>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "bricks":
        return (
          <BricksPage
            onNavigateToAddBrick={(collectionId) => {
              setSubview({ type: "addBrick", collectionId });
            }}
            onNavigateToEditBrick={(brick) => {
              setSubview({ type: "editBrick", brick });
            }}
            onNavigateToPractice={(brickId) => {
              setPracticeBrickId(brickId ?? null);
              setSelectedTab("practice");
            }}
            onNavigateToSearch={() => setSubview({ type: "search" })}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
          />
        );
      case "discover":
        return <DiscoverPage />;
      case "practice":
        return (
          <PracticePage
            targetBrickId={practiceBrickId}
            onClearTargetBrickId={() => setPracticeBrickId(null)}
            onNavigateToAddBrick={() => setSubview({ type: "addBrick" })}
            onNavigateToEditBrick={(brick) =>
              setSubview({ type: "editBrick", brick })
            }
            finishedCount={practiceFinishedCount}
            onIncrementFinishedCount={() =>
              setPracticeFinishedCount((prev) => prev + 1)
            }
            elapsedSeconds={practiceElapsedSeconds}
            onTickTimer={() => setPracticeElapsedSeconds((prev) => prev + 1)}
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
        setActiveTab={handleSelectTab}
        clearSubviews={() => setSubview(null)}
        isLoggedIn={Boolean(learner)}
        onClearPracticeBrickId={() => setPracticeBrickId(null)}
      />

      {/* Main screen area dedicated strictly to displaying the scrollable content */}
      <main className="flex-1 w-full flex flex-col pt-14 sm:pt-16 pb-6 sm:pb-8">
        <Suspense fallback={<PageLoadingFallback />}>
          {renderTab()}
        </Suspense>
      </main>

      {authModalMode && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={Boolean(authModalMode)}
            initialMode={authModalMode || "login"}
            onClose={() => setAuthModalMode(null)}
            onSuccess={() => {
              setSelectedTab("practice");
            }}
          />
        </Suspense>
      )}

      <Toaster position="top-center" richColors />
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
