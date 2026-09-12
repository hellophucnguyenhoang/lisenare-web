import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { request, RequestError } from "@/api/client";
import { useLearnerMe } from "@/hooks/useLearner";
import {
  type ActiveTab,
  type AuthMode,
  type Subview,
} from "@/types";

import BricksPage from "@/pages/BricksPage";
import SearchPage from "@/pages/SearchPage";
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
  const [subview, setSubview] = useState<Subview>(null);
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(null);
  const [isPracticeTyping, setIsPracticeTyping] = useState(false);
  const [practiceBrickId, setPracticeBrickId] = useState<number | null>(null);
  const [practiceFinishedCount, setPracticeFinishedCount] = useState(0);
  const [practiceElapsedSeconds, setPracticeElapsedSeconds] = useState(0);

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

  if (subview?.type === "search") {
    return (
      <>
        <SearchPage
          onBack={() => setSubview(null)}
          onNavigateToPractice={(brickId) => {
            setPracticeBrickId(brickId ?? null);
            setSubview(null);
            setActiveTab("practice");
          }}
        />
        <Toaster position="top-center" richColors />
      </>
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
              setActiveTab("practice");
            }}
            onNavigateToSearch={() => setSubview({ type: "search" })}
          />
        );
      case "discover":
        return <DiscoverPage />;
      case "practice":
        return (
          <PracticePage
            targetBrickId={practiceBrickId}
            onClearTargetBrickId={() => setPracticeBrickId(null)}
            onTypingModeChange={setIsPracticeTyping}
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

  const isTypingActive = isPracticeTyping && activeTab === "practice";

  return (
    <div
      className={`min-h-screen bg-surface ${
        isTypingActive
          ? "pb-2 max-h-[100dvh] overflow-y-auto overscroll-none"
          : "pb-20"
      }`}
    >
      {renderTab()}

      {!isTypingActive && (
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "practice") {
              setPracticeBrickId(null);
            }
            setActiveTab(tab);
          }}
          clearSubviews={() => setSubview(null)}
        />
      )}

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
