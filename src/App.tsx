import { useState, useEffect } from "react";
import { type Brick, type Collection, type BrickStatus } from "./types";
import { initialBricks, initialCollections, discoverBricks } from "./data";
import Header from "./components/Header";
import BottomNavBar from "./components/BottomNavBar";
import PracticeView from "./components/PracticeView";
import CollectionsView from "./components/CollectionsView";
import DiscoverView from "./components/DiscoverView";
import ProfileView from "./components/ProfileView";
import AddBrickView from "./components/AddBrickView";
import EditBrickView from "./components/EditBrickView";
import FiltersView from "./components/FiltersView";
import PracticeResultsView from "./components/PracticeResultsView";

export default function App() {
  // --- STATE INITIALIZATION ---
  const [activeTab, setActiveTab] = useState<
    "practice" | "collections" | "discover" | "profile"
  >("collections");
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [activeSubview, setActiveSubview] = useState<
    "addBrick" | "editBrick" | "filters" | null
  >(null);
  const [activeEditBrickId, setActiveEditBrickId] = useState<string | null>(
    null,
  );

  // App persistence states
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [points, setPoints] = useState<number>(340); // seed XP matching stats

  // Filter and Sorting state
  const [filterStatus, setFilterStatus] = useState<BrickStatus[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortType, setSortType] = useState<
    "recommended" | "newest" | "oldest" | "az" | "za"
  >("recommended");
  const [searchQuery, setSearchQuery] = useState("");

  // Practice session completion modal
  const [sessionResults, setSessionResults] = useState<{
    overall: number;
    pronunciation: number;
    accuracy: number;
  } | null>(null);

  // Load from localStorage or seed initial data
  useEffect(() => {
    const savedBricks = localStorage.getItem("bricklearn_bricks");
    const savedCollections = localStorage.getItem("bricklearn_collections");
    const savedPoints = localStorage.getItem("bricklearn_points");

    if (savedBricks) {
      setBricks(JSON.parse(savedBricks));
    } else {
      setBricks(initialBricks);
      localStorage.setItem("bricklearn_bricks", JSON.stringify(initialBricks));
    }

    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    } else {
      setCollections(initialCollections);
      localStorage.setItem(
        "bricklearn_collections",
        JSON.stringify(initialCollections),
      );
    }

    if (savedPoints) {
      setPoints(parseInt(savedPoints, 10));
    } else {
      setPoints(340);
    }
  }, []);

  // Helper to persist changes
  const updatePersistedBricks = (updatedBricks: Brick[]) => {
    setBricks(updatedBricks);
    localStorage.setItem("bricklearn_bricks", JSON.stringify(updatedBricks));
  };

  const updatePersistedCollections = (updatedCol: Collection[]) => {
    setCollections(updatedCol);
    localStorage.setItem("bricklearn_collections", JSON.stringify(updatedCol));
  };

  const incrementPoints = (pts: number) => {
    const newPts = points + pts;
    setPoints(newPts);
    localStorage.setItem("bricklearn_points", newPts.toString());
  };

  // --- SUBVIEW HANDLERS ---
  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setActiveSubview(null);
    setSearchQuery("");
  };

  const handleClearSubviews = () => {
    setSelectedCollectionId(null);
    setActiveSubview(null);
    setActiveEditBrickId(null);
    setSearchQuery("");
  };

  const handleAddCollection = (
    name: string,
    description: string,
    iconName: string,
  ) => {
    const newCol: Collection = {
      id: `col_${Date.now()}`,
      name,
      description,
      iconName,
      tags: ["Custom"],
      color: "primary",
      progress: 0,
    };
    const updated = [...collections, newCol];
    updatePersistedCollections(updated);
  };

  const handleDeleteCollection = (id: string) => {
    const updatedCols = collections.filter((c) => c.id !== id);
    // Also cascade delete bricks belonging to this deleted collection
    const updatedBricks = bricks.filter((b) => b.collectionId !== id);
    updatePersistedCollections(updatedCols);
    updatePersistedBricks(updatedBricks);
    if (selectedCollectionId === id) {
      setSelectedCollectionId(null);
    }
  };

  const handleTriggerAddBrick = (colId: string) => {
    setSelectedCollectionId(colId);
    setActiveSubview("addBrick");
  };

  const handleTriggerEditBrick = (brickId: string) => {
    setActiveEditBrickId(brickId);
    setActiveSubview("editBrick");
  };

  const handleAddBrick = (newBrickFields: Omit<Brick, "id" | "createdAt">) => {
    const newBrick: Brick = {
      ...newBrickFields,
      id: `brick_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bricks, newBrick];
    updatePersistedBricks(updated);
    incrementPoints(15); // Builder bonus points
  };

  const handleUpdateBrickFields = (
    id: string,
    updatedFields: Partial<Brick>,
  ) => {
    const updated = bricks.map((b) =>
      b.id === id ? { ...b, ...updatedFields } : b,
    );
    updatePersistedBricks(updated);
  };

  const handleUpdateBrickStatus = (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => {
    const updated = bricks.map((b) => (b.id === id ? { ...b, status } : b));
    updatePersistedBricks(updated);
  };

  const handleDeleteBrick = (id: string) => {
    const updated = bricks.filter((b) => b.id !== id);
    updatePersistedBricks(updated);
    if (activeEditBrickId === id) {
      setActiveSubview(null);
      setActiveEditBrickId(null);
    }
  };

  // Extract all unique tags in active collection or application to display in filters
  const getUniqueTags = () => {
    const sourceBricks = selectedCollectionId
      ? bricks.filter((b) => b.collectionId === selectedCollectionId)
      : bricks;

    const allTags = sourceBricks.flatMap((b) => b.tags);
    return Array.from(new Set(allTags)) as string[];
  };

  // --- RENDER ROUTER ---
  const renderContent = () => {
    // Check if subview overlay matches
    if (activeSubview === "addBrick" && selectedCollectionId) {
      return (
        <AddBrickView
          collectionId={selectedCollectionId}
          collections={collections}
          onAddBrick={handleAddBrick}
          onBack={() => setActiveSubview(null)}
        />
      );
    }

    if (activeSubview === "editBrick" && activeEditBrickId) {
      return (
        <EditBrickView
          brickId={activeEditBrickId}
          bricks={bricks}
          collections={collections}
          onUpdateBrick={handleUpdateBrickFields}
          onDeleteBrick={handleDeleteBrick}
          onBack={() => setActiveSubview(null)}
        />
      );
    }

    if (activeSubview === "filters") {
      return (
        <FiltersView
          onBack={() => setActiveSubview(null)}
          onApplyFilters={(sort, status, tags) => {
            setSortType(sort);
            setFilterStatus(status);
            setFilterTags(tags);
          }}
          onClearAll={() => {
            setSortType("recommended");
            setFilterStatus([]);
            setFilterTags([]);
          }}
          initialSort={sortType}
          initialStatus={filterStatus}
          initialTags={filterTags}
          allTags={getUniqueTags()}
        />
      );
    }

    // Standard tab routers
    switch (activeTab) {
      case "practice":
        return (
          <PracticeView
            bricks={bricks}
            collections={collections}
            onUpdateBrickStatus={handleUpdateBrickStatus}
            onIncrementPoints={incrementPoints}
            onShowResults={(overall, pron, acc) => {
              setSessionResults({
                overall,
                pronunciation: pron,
                accuracy: acc,
              });
            }}
          />
        );

      case "collections":
        return (
          <CollectionsView
            collections={collections}
            bricks={bricks}
            onSelectCollection={handleSelectCollection}
            selectedCollectionId={selectedCollectionId}
            onBack={() => setSelectedCollectionId(null)}
            onAddBrick={handleTriggerAddBrick}
            onEditBrick={handleTriggerEditBrick}
            onDeleteBrick={handleDeleteBrick}
            onAddCollection={handleAddCollection}
            onDeleteCollection={handleDeleteCollection}
            onOpenFilters={() => setActiveSubview("filters")}
            filterStatus={filterStatus}
            filterTags={filterTags}
            sortType={sortType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onStudyBrick={(brick) => {
              // Quick jump to practice tab for this specific brick
              setActiveTab("practice");
            }}
          />
        );

      case "discover":
        return (
          <DiscoverView
            discoverBricks={discoverBricks}
            collections={collections}
            onAddBrickToCollection={handleAddBrick}
            onIncrementPoints={incrementPoints}
          />
        );

      case "profile":
        return (
          <ProfileView
            bricks={bricks}
            collections={collections}
            points={points}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-surface text-on-surface font-sans antialiased overflow-x-hidden">
      {/* Visual global glow rings */}
      <div className="fixed top-1/4 -left-24 w-72 h-72 bg-primary/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-1/4 -right-24 w-72 h-72 bg-secondary/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Main app top bar (Desktop Navigation included) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clearSubviews={handleClearSubviews}
      />

      {/* Primary body screen canvas */}
      <main className="w-full">{renderContent()}</main>

      {/* Session completion visual overlay */}
      {sessionResults && (
        <PracticeResultsView
          overallScore={sessionResults.overall}
          pronunciationScore={sessionResults.pronunciation}
          accuracyScore={sessionResults.accuracy}
          onNext={() => {
            setSessionResults(null);
            // reset session in PracticeView by refreshing it
            setActiveTab("collections");
            setTimeout(() => {
              setActiveTab("practice");
            }, 50);
          }}
          onClose={() => {
            setSessionResults(null);
            setActiveTab("collections");
          }}
        />
      )}

      {/* Mobile Sticky bottom navigation controller */}
      {activeSubview === null && (
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          clearSubviews={handleClearSubviews}
        />
      )}
    </div>
  );
}
