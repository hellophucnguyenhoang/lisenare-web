import CollectionCard from "./CollectionCard";

const sampleCollection = {
  id: 1,
  name: "Travel Phrases",
  description: "Essential phrases for your next trip.",
  brickCount: 5000,
  learnedCount: 1000,
  tags: ["odd english", "odd"],
};

export default function CollectionCardTest() {
  return (
    <CollectionCard
      collection={sampleCollection}
      onSelectCollection={(id) => console.log("Selected:", id)}
      onDeleteCollection={(id) => alert(`Delete clicked for ${id}`)}
      onEditCollection={(coll) => console.log("Editing:", coll.name)}
    />
  );
}
